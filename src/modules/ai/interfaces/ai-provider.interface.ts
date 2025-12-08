import { IAiPrompt } from 'src/interfaces/prompt.interface';
import { ContentStatus } from '../../content/enums/content.enum';

export interface IAIContentResponse {
    content: string;
    title: string;
    status: ContentStatus;
}

export interface IAIProvider {
    generateContent(aiPrompt: IAiPrompt, model?: string): Promise<IAIContentResponse>;
}
