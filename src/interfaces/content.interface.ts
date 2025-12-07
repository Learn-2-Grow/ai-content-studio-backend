import { Document, Types } from 'mongoose';
import { ContentStatus } from 'src/modules/content/enums/content.enum';

export interface IContent extends Document {
    _id: Types.ObjectId;
    threadId: string | Types.ObjectId;
    prompt: string;
    generatedContent: string;
    status: ContentStatus;
    statusUpdatedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
