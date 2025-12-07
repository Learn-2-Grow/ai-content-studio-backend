import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { NestHelper } from 'src/common/helpers/nest.helper';
import { IThread } from 'src/interfaces/thread.interface';
import { Thread, ThreadDocument } from './entities/thread.entity';

export class ThreadRepository {
    constructor(
        @InjectModel(Thread.name) private readonly threadModel: Model<ThreadDocument>,
    ) { }

    async create(thread: Partial<IThread>): Promise<IThread> {
        const threadDoc = await this.threadModel.create(thread);
        return threadDoc.toObject();
    }

    async findById(id: any): Promise<IThread | null> {
        const idObject = NestHelper.getInstance().getObjectId(id);
        const thread = await this.threadModel.findById(idObject).exec();
        return thread?.toObject() || null;
    }

    async findByUserId(userId: string): Promise<IThread[]> {
        const threads = await this.threadModel.find({ userId, status: { $ne: 'deleted' } }).sort({ createdAt: -1 }).exec();
        return threads.map(thread => thread.toObject());
    }

    async update(id: any, thread: Partial<IThread>): Promise<IThread | null> {
        const idObject = NestHelper.getInstance().getObjectId(id);
        const updatedThread = await this.threadModel.findByIdAndUpdate(idObject, thread, { new: true }).exec();
        return updatedThread?.toObject() || null;
    }

    async delete(id: string): Promise<IThread | null> {
        const idObject = NestHelper.getInstance().getObjectId(id);
        return this.threadModel.findByIdAndDelete(idObject).exec();
    }

    async findByIdAndUserId(id: string, userId: any): Promise<IThread | null> {
        const userIdObjectId = NestHelper.getInstance().getObjectId(userId);
        const thread = await this.threadModel.findOne({ _id: id, userId: userIdObjectId }).exec();
        return thread?.toObject() || null;
    }

    async getTotalThreadsByUserId(userId: any): Promise<number> {
        const userIdObjectId = NestHelper.getInstance().getObjectId(userId);
        return this.threadModel.countDocuments({ userId: userIdObjectId }).exec();
    }

    async getThreadCountsByType(userId?: any): Promise<Array<{ _id: string; count: number }>> {

        let userIdObjectId = null;
        if (userId) {
            userIdObjectId = NestHelper.getInstance().getObjectId(userId);
        }

        const aggregate: PipelineStage[] = [];
        if (userIdObjectId) {
            aggregate.push({ $match: { userId: userIdObjectId } });
        }
        aggregate.push({ $group: { _id: '$type', count: { $sum: 1 } } });

        const threadsByType = await this.threadModel.aggregate(aggregate).exec();

        return threadsByType.map(thread => thread.toObject());
    }
}
