import { ContentStatus } from '../../content/enums/content.enum';

export interface IAIContentResponse {
    content: string;
    title: string;
    status: ContentStatus;
}

export interface IAIProvider {
    generateContent(prompt: string, model?: string): Promise<IAIContentResponse>;
    generateContentWithTitle(
        contentPrompt: string,
        titlePrompt: string,
        model?: string,
    ): Promise<IAIContentResponse>;
}
