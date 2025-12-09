import { ContentStatus } from '../enums/content.enum';
import { SentimentType } from '../enums/sentiment.enum';
import { IAiPrompt } from './prompt.interface';

export interface IAIContentResponse {
    content: string;
    title: string;
    status: ContentStatus;
    sentiment?: SentimentType;
}

export interface IAIProvider {
    generateContent(aiPrompt: IAiPrompt, model?: string): Promise<IAIContentResponse>;
}
