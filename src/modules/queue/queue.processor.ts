import { Process, Processor } from '@nestjs/bull';
import { Inject, Logger, forwardRef } from '@nestjs/common';
import { Job } from 'bull';
import { IJobData } from 'src/interfaces/queue.interface';
import { ContentService } from '../content/content.service';
import { QueueName, QueueProcess } from './enums/queue.enum';

@Processor(QueueName.CONTENT_GENERATION)
export class QueueProcessor {
    private readonly logger = new Logger(QueueProcessor.name);

    constructor(
        @Inject(forwardRef(() => ContentService))
        private readonly contentService: ContentService,
    ) { }

    @Process(QueueProcess.GENERATE_CONTENT)
    async handleGenerateContentJob(job: Job) {
        const jobData = job.data as IJobData;
        this.logger.log(`Processing content generation job: ${jobData.contentId} for thread: ${jobData.threadId}`);

        try {
            await this.contentService.executeContentGeneration(jobData);

            this.logger.log(`Content generation completed: ${jobData.contentId}`);
        } catch (error) {
            this.logger.error(`Error processing content generation: ${jobData.contentId}`, error.stack);


        }
    }
}
