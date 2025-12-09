import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { NestHelper } from 'src/common/helpers/nest.helper';
import { IContent } from 'src/common/interfaces/content.interface';
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

    findOneAndUpdate(id: any, content: Partial<IContent>): Promise<IContent | null> {
        const idObject = NestHelper.getInstance().getObjectId(id);
        return this.contentModel.findByIdAndUpdate(idObject, content, { new: true }).exec();
    }

    async update(id: any, content: Partial<IContent>): Promise<IContent | null> {
        const idObject = NestHelper.getInstance().getObjectId(id);
        const updatedContent = await this.contentModel.findByIdAndUpdate(idObject, content, { new: true }).exec();
        return updatedContent.toObject();
    }

    async delete(id: string): Promise<IContent | null> {
        return this.contentModel.findByIdAndDelete(id).exec();
    }

    async findByJobId(id: string): Promise<IContent | null> {
        const content = await this.contentModel.findById(id).exec();
        return content?.toObject() || null;
    }

    // Aggregates content status counts by user.
    async aggregateStatusCountsByUserId(threadIds: string[]): Promise<Array<{ _id: string; count: number }>> {

        const aggregate: PipelineStage[] = [];
        if (threadIds?.length > 0) {
            aggregate.push({ $match: { threadId: { $in: threadIds } } });
        }
        aggregate.push({ $group: { _id: '$status', count: { $sum: 1 } } });

        const statusCounts = await this.contentModel.aggregate(aggregate).exec();
        return statusCounts;
    }

    async findAll(filter: any): Promise<IContent[]> {
        const contents = await this.contentModel.find(filter).exec();
        return contents?.map(content => content?.toObject() || null) || [];
    }

    // Returns a map of threadId to latest IContent.
    async findLatestContentByThreadIds(threadIds: string[]): Promise<Map<string, IContent>> {
        if (!threadIds || threadIds.length === 0) {
            return new Map();
        }

        const pipeline: PipelineStage[] = [
            {
                $match: {
                    threadId: { $in: threadIds }
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: '$threadId',
                    latestContent: { $first: '$$ROOT' }
                }
            },


        ];

        const results = await this.contentModel.aggregate(pipeline).exec();

        const contentMap = new Map<string, IContent>();
        results.forEach((result) => {
            const threadIdString = result._id.toString();
            if (result.latestContent) {
                contentMap.set(threadIdString, {
                    _id: result.latestContent._id,
                    threadId: result.latestContent.threadId,
                    status: result.latestContent.status,
                    statusUpdatedAt: result.latestContent.statusUpdatedAt,
                    createdAt: result.latestContent.createdAt,
                    updatedAt: result.latestContent.updatedAt,
                    sentiment: result.latestContent.sentiment
                } as IContent);
            }
        });

        return contentMap;
    }
}
