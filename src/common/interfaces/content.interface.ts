import { Document, Types } from 'mongoose';
import { AIProvider } from 'src/common/enums/ai-provider.enum';
import { ContentStatus } from 'src/common/enums/content.enum';
import { SentimentType } from '../enums/sentiment.enum';

export interface IContent extends Document {
    _id: Types.ObjectId;
    threadId: string | Types.ObjectId;
    prompt: string;
    generatedContent: string;
    status: ContentStatus;
    statusUpdatedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    provider?: AIProvider;
    sentiment?: SentimentType;
}
