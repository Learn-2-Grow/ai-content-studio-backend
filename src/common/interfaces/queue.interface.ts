import { AIProvider } from 'src/common/enums/ai-provider.enum';

export interface IJobData {
    contentId: string;
    userId: string;
    threadId: string;
    provider?: AIProvider;
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