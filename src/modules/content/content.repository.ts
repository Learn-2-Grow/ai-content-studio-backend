import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NestHelper } from 'src/common/helpers/nest.helper';
import { IContent } from 'src/interfaces/content.interface';
import { Content, ContentDocument } from './entities/content.entity';

export class ContentRepository {
    constructor(
        @InjectModel(Content.name) private readonly contentModel: Model<ContentDocument>,
    ) { }

    async create(content: Partial<IContent>): Promise<IContent> {
        const contentDoc = await this.contentModel.create(content);
        return contentDoc;
    }

    async findById(id: string): Promise<IContent | null> {
        return this.contentModel.findById(id).exec();
    }

    async findByThreadId(threadId: any): Promise<IContent[]> {
        const threadIdObject = NestHelper.getInstance().getObjectId(threadId);
        return this.contentModel.find({ threadId: threadIdObject }).sort({ createdAt: -1 }).exec();
    }

    async update(id: any, content: Partial<IContent>): Promise<IContent | null> {
        const idObject = NestHelper.getInstance().getObjectId(id);
        return this.contentModel.findByIdAndUpdate(idObject, content, { new: true }).exec();
    }

    async delete(id: string): Promise<IContent | null> {
        return this.contentModel.findByIdAndDelete(id).exec();
    }

    async findByJobId(jobId: string): Promise<IContent | null> {
        // Using _id as jobId
        return this.contentModel.findById(jobId).exec();
    }
}
