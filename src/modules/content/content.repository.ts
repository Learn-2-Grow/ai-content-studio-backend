import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { NestHelper } from 'src/common/helpers/nest.helper';
import { IContent } from 'src/interfaces/content.interface';
import { Content, ContentDocument } from './entities/content.entity';

export class ContentRepository {
    constructor(
        @InjectModel(Content.name) private readonly contentModel: Model<ContentDocument>,
    ) { }

    async create(content: Partial<IContent>): Promise<IContent> {
        const contentDoc = await this.contentModel.create(content);
        return contentDoc.toObject();
    }

    async findById(id: string): Promise<IContent | null> {
        return this.contentModel.findById(id).exec();
    }

    async findByThreadId(threadId: any, currentContentId: any): Promise<IContent[]> {
        const threadIdObject = NestHelper.getInstance().getObjectId(threadId);
        return this.contentModel.find({ threadId: threadIdObject, _id: { $ne: currentContentId } }).sort({ createdAt: -1 }).exec();
    }

    async update(id: any, content: Partial<IContent>): Promise<IContent | null> {
        const idObject = NestHelper.getInstance().getObjectId(id);
        const updatedContent = await this.contentModel.findByIdAndUpdate(idObject, content, { new: true }).exec();
        return updatedContent.toObject();
    }

    async delete(id: string): Promise<IContent | null> {
        return this.contentModel.findByIdAndDelete(id).exec();
    }

    async findByJobId(jobId: string): Promise<IContent | null> {
        // Using _id as jobId
        const content = await this.contentModel.findById(jobId).exec();
        return content?.toObject() || null;
    }

    /**
     * Executes aggregation query to get content status counts by userId.
     * Returns raw aggregation results - business logic should be in service layer.
     */
    async aggregateStatusCountsByUserId(userId: any): Promise<Array<{ _id: string; count: number }>> {
        let userIdObject = null;
        if (userId) {
            userIdObject = NestHelper.getInstance().getObjectId(userId);
        }

        const aggregate: PipelineStage[] = [];
        if (userIdObject) {
            aggregate.push({ $match: { userId: userIdObject } });
        }
        aggregate.push({ $group: { _id: '$status', count: { $sum: 1 } } });

        const statusCounts = await this.contentModel.aggregate(aggregate).exec();
        return statusCounts.map(status => status.toObject());
    }

    async findAll(filter: any): Promise<IContent[]> {
        const contents = await this.contentModel.find(filter).exec();
        return contents?.map(content => content?.toObject() || null) || [];
    }
}
