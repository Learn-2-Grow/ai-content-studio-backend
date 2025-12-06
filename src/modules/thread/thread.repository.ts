import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NestHelper } from 'src/common/helpers/nest.helper';
import { IThread } from 'src/interfaces/thread.interface';
import { Thread, ThreadDocument } from './entities/thread.entity';

export class ThreadRepository {
    constructor(
        @InjectModel(Thread.name) private readonly threadModel: Model<ThreadDocument>,
    ) { }

    async create(thread: Partial<IThread>): Promise<IThread> {
        const threadDoc = await this.threadModel.create(thread);
        return threadDoc;
    }

    async findById(id: any): Promise<IThread | null> {
        const idObject = NestHelper.getInstance().getObjectId(id);
        return this.threadModel.findById(idObject).exec();
    }

    async findByUserId(userId: string): Promise<IThread[]> {
        return this.threadModel.find({ userId, status: { $ne: 'deleted' } }).sort({ createdAt: -1 }).exec();
    }

    async update(id: any, thread: Partial<IThread>): Promise<IThread | null> {
        const idObject = NestHelper.getInstance().getObjectId(id);
        return this.threadModel.findByIdAndUpdate(idObject, thread, { new: true }).exec();
    }

    async delete(id: string): Promise<IThread | null> {
        const idObject = NestHelper.getInstance().getObjectId(id);
        return this.threadModel.findByIdAndDelete(idObject).exec();
    }

    async findByIdAndUserId(id: string, userId: any): Promise<IThread | null> {
        const userIdObjectId = NestHelper.getInstance().getObjectId(userId);
        return this.threadModel.findOne({ _id: id, userId: userIdObjectId }).exec();
    }
}
