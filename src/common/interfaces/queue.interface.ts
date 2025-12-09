import { AIProvider } from 'src/common/enums/ai-provider.enum';
import { SentimentType } from '../enums/sentiment.enum';

export interface IJobData {
    contentId: string;
    userId: string;
    threadId: string;
    provider?: AIProvider;
    sentiment?: SentimentType;
}

export interface JobOptions {
    delay?: number;
    attempts?: number;
    priority?: number;
    removeOnComplete?: boolean | number;
    removeOnFail?: boolean | number;
    timeout?: number;
    jobId?: string;
}