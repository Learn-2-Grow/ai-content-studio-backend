import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { NestHelper } from 'src/common/helpers/nest.helper';
import { PromptHelper } from 'src/common/helpers/prompt.helper';
import { IContent } from 'src/interfaces/content.interface';
import { IAiPrompt, IPromptPayload } from 'src/interfaces/prompt.interface';
import { IJobData } from 'src/interfaces/queue.interface';
import { IThread } from 'src/interfaces/thread.interface';
import { IUser } from 'src/interfaces/user.interface';
import { ExceptionHelper } from '../../common/helpers/exceptions.helper';
import { AIService } from '../ai/ai.service';
import { QueueProcess } from '../queue/enums/queue.enum';
import { QueueService } from '../queue/queue.service';
import { ThreadService } from '../thread/thread.service';
import { UserService } from '../user/user.service';
import { ContentRepository } from './content.repository';
import { GenerateContentDto } from './dto/generate-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { ContentStatus } from './enums/content.enum';

@Injectable()
export class ContentService {
    private readonly logger = new Logger(ContentService.name);

    constructor(
        private readonly contentRepository: ContentRepository,
        private readonly threadService: ThreadService,
        private readonly queueService: QueueService,
        private readonly aiService: AIService,
        private readonly userService: UserService,
    ) { }

    async generateContent(user: IUser, generateContentDto: GenerateContentDto): Promise<IThread> {

        // Get content thread
        const thread: IThread = await this.generateThread(generateContentDto, user);

        // Create content record
        const content: IContent = await this.create(thread, generateContentDto);
        thread.lastContent = content;

        const jobId = content._id.toString();
        const jobData: IJobData = {
            contentId: jobId,
            userId: user._id.toString(),
            threadId: thread._id.toString(),
            provider: generateContentDto.provider, // Pass provider to job
        };

        // Add job to queue with 1-minute delay
        // await this.queueService.addJob(QueueProcess.GENERATE_CONTENT, jobData, { delay: 60000, attempts: 3 });
        await this.queueService.addJob(QueueProcess.GENERATE_CONTENT, jobData, { delay: 5000, attempts: 3 });

        this.logger.log(`Content generation job queued: ${jobId} for thread: ${thread._id}`);

        return thread;
    }

    async create(thread: IThread, generateContentDto: GenerateContentDto): Promise<IContent> {

        const contentObject: Partial<IContent> = {
            threadId: NestHelper.getInstance().getObjectId(thread._id),
            prompt: generateContentDto.prompt,
            generatedContent: '',
            status: ContentStatus.PENDING,
        };
        const content = await this.contentRepository.create(contentObject);
        return content;
    }

    async generateThread(generateContentDto: GenerateContentDto, user: IUser): Promise<IThread> {
        let thread: IThread;

        // If threadId not provided, auto-create thread
        if (!generateContentDto.threadId) {

            const title = generateContentDto?.prompt?.split(' ')?.slice(0, 3)?.join(' ') || '';
            thread = await this.threadService.create(user, {
                // Take first 3 words of the prompt
                title: `${title} - ${generateContentDto.contentType}`,
                type: generateContentDto.contentType,
            });

        } else {
            // Verify thread exists and belongs to user
            thread = await this.threadService.findUserThreadByThreadId(generateContentDto.threadId, user._id);
            if (!thread) {
                ExceptionHelper.getInstance().defaultError(
                    'Thread not found',
                    'THREAD_NOT_FOUND',
                    HttpStatus.NOT_FOUND
                );
            }
        }

        return thread;
    }

    async processContentJob(jobData: IJobData): Promise<void> {
        try {
            await this.executeContentGeneration(jobData);
        } catch (error) {
            this.handleContentJobError(jobData, error);
        }
    }

    async executeContentGeneration(jobData: IJobData): Promise<void> {

        const { content, thread, previousContents } = await this.fetchJobData(jobData);
        if (!content || !thread) return;

        const promptPayload: IPromptPayload = this.buildGeneralPromptPayload(content, thread, previousContents);

        const aiPrompt: IAiPrompt = PromptHelper.buildSmallPrompt(promptPayload);
        PromptHelper.setExpectedPromptResponseFormat(aiPrompt);
        const aiResponse = await this.aiService.generateContent(aiPrompt, jobData.provider);

        this.logger.log(`AI response: ${JSON.stringify(aiResponse)}`);

        await this.contentRepository.update(content._id, {
            generatedContent: aiResponse.content,
            status: aiResponse.status,
        });

        // Update thread title if it's the first content in the thread
        if (aiResponse.status === ContentStatus.COMPLETED && aiResponse.title && previousContents?.length === 0) {
            await this.threadService.updateTitle(thread._id, aiResponse.title);
        }

        if (aiResponse.sentiment) {
            await this.userService.updateSentiment(jobData.userId, aiResponse.sentiment);
        }
    }

    async fetchJobData(jobData: IJobData) {

        const [content, thread] = await Promise.all([
            this.contentRepository.findById(jobData.contentId),
            this.threadService.findUserThreadByThreadId(jobData.threadId, jobData.userId),
        ]);

        const previousContents = thread ? await this.contentRepository.findByThreadId(thread._id.toString(), jobData.contentId) : [];
        return { content, thread, previousContents };
    }

    buildGeneralPromptPayload(content: IContent, thread: IThread, previousContents: IContent[]): IPromptPayload {

        const previousResponses = previousContents?.length > 0
            ? previousContents.map(c => ({ prompt: c.prompt, response: c.generatedContent }))
            : [];

        return {
            type: thread.type,
            history: previousResponses,
            current: { prompt: content.prompt },
        };
    }

    async handleContentJobError(jobData: IJobData, error: any): Promise<void> {

        this.logger.error(`Error processing content job: ${error.message}`, error.stack);
        await this.contentRepository.update(jobData.contentId, { status: ContentStatus.FAILED });
    }

    async findOne(id: string, userId: string): Promise<IContent> {

        const content = await this.contentRepository.findById(id);

        if (!content) {
            ExceptionHelper.getInstance().defaultError(
                'Content not found',
                'CONTENT_NOT_FOUND',
                HttpStatus.NOT_FOUND,
            );
        }

        // Verify thread belongs to user
        const threadIdString = typeof content.threadId === 'string' ? content.threadId : content.threadId.toString();
        const thread = await this.threadService.findUserThreadByThreadId(threadIdString, userId);
        if (!thread) {
            ExceptionHelper.getInstance().defaultError(
                'Content not found',
                'CONTENT_NOT_FOUND',
                HttpStatus.NOT_FOUND,
            );
        }

        return content;
    }

    async update(id: string, userId: string, updateContentDto: UpdateContentDto): Promise<IContent> {
        await this.findOne(id, userId);

        const updated = await this.contentRepository.update(id, updateContentDto);

        if (!updated) {
            ExceptionHelper.getInstance().defaultError(
                'Failed to update content',
                'CONTENT_UPDATE_FAILED',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        return updated;
    }

    async remove(id: string, userId: string): Promise<void> {
        await this.findOne(id, userId);
        await this.contentRepository.delete(id);
        this.logger.log(`Content deleted: ${id} by user: ${userId}`);
    }

    /**
     * Gets content status counts.
     */
    async getStatusCountsByUserId(userId: any): Promise<Record<string, number>> {

        const userIdObject = NestHelper.getInstance().getObjectId(userId);
        const statusCounts = await this.contentRepository.aggregateStatusCountsByUserId(userIdObject);

        const statusCountsMap: Record<string, number> = {
            [ContentStatus.PENDING]: 0,
            [ContentStatus.PROCESSING]: 0,
            [ContentStatus.COMPLETED]: 0,
            [ContentStatus.FAILED]: 0,
        };

        statusCounts.forEach((item) => {
            statusCountsMap[item._id as ContentStatus] = item.count;
        });

        return statusCountsMap;
    }
}
