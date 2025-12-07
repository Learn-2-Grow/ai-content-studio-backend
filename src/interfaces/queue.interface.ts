import { AIProvider } from 'src/common/enums/ai-provider.enum';

export interface IJobData {
    contentId: string;
    userId: string;
    threadId: string;
    provider?: AIProvider; // Provider to use for generation
}