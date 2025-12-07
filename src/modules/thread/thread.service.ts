import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { NestHelper } from 'src/common/helpers/nest.helper';
import { IThread } from 'src/interfaces/thread.interface';
import { IUser } from 'src/interfaces/user.interface';
import { ExceptionHelper } from '../../common/helpers/exceptions.helper';
import { CreateThreadDto } from './dto/create-thread.dto';
import { UpdateThreadDto } from './dto/update-thread.dto';
import { ThreadStatus } from './enums/thread.enum';
import { ThreadRepository } from './thread.repository';

@Injectable()
export class ThreadService {
    private readonly logger = new Logger(ThreadService.name);

    constructor(
        private readonly threadRepository: ThreadRepository,
    ) { }

    async create(user: IUser, createThreadDto: CreateThreadDto): Promise<IThread> {

        const threadObject: Partial<IThread> = {
            userId: NestHelper.getInstance().getObjectId(user._id),
            title: createThreadDto.title,
            type: createThreadDto.type,
            status: createThreadDto.status || ThreadStatus.ACTIVE,
        };

        const thread = await this.threadRepository.create(threadObject);

        this.logger.log(`Thread created: ${thread._id} by user: ${user.name} (${user._id})`);
        return thread;
    }

    async findUserThreadByThreadId(threadId: string, userId: any): Promise<IThread> {

        if (!threadId || !userId) {
            return null;
        }

        const userIdObject = NestHelper.getInstance().getObjectId(userId);
        return this.threadRepository.findByIdAndUserId(threadId, userIdObject);
    }

    async updateTitle(id: any, title: string): Promise<IThread> {

        const idObject = NestHelper.getInstance().getObjectId(id);
        return this.threadRepository.update(idObject, { title });
    }

    async update(id: string, userId: string, updateThreadDto: UpdateThreadDto): Promise<IThread> {
        const thread = await this.threadRepository.findByIdAndUserId(id, userId);
        if (!thread) {
            ExceptionHelper.getInstance().defaultError(
                'Thread not found',
                'THREAD_NOT_FOUND',
                HttpStatus.NOT_FOUND,
            );
        }

        const updated = await this.threadRepository.update(id, updateThreadDto);

        if (!updated) {
            ExceptionHelper.getInstance().defaultError(
                'Failed to update thread',
                'THREAD_UPDATE_FAILED',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        return updated;
    }

    async remove(id: string, userId: string): Promise<void> {
        const thread = await this.threadRepository.findByIdAndUserId(id, userId);
        if (!thread) {
            ExceptionHelper.getInstance().defaultError(
                'Thread not found',
                'THREAD_NOT_FOUND',
                HttpStatus.NOT_FOUND,
            );
        }
        await this.threadRepository.delete(id);
        this.logger.log(`Thread deleted: ${id} by user: ${userId}`);
    }

}
