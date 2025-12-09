import { IAiPrompt } from './prompt.interface';
import { ContentStatus } from '../enums/content.enum';

export interface IAIContentResponse {
    content: string;
    title: string;
    status: ContentStatus;
}

export interface IAIProvider {
    generateContent(aiPrompt: IAiPrompt, model?: string): Promise<IAIContentResponse>;
}
