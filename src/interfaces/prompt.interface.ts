import { PromptTone } from 'src/common/enums/prompt.enum';
import { ContentType } from 'src/modules/thread/enums/thread.enum';

export interface IPromptHistoryItem {
    prompt: string;
    response: string;
}

export interface IPromptCurrentRequest {
    prompt: string;
    tone?: PromptTone;
    language?: string; // e.g. "en", "bn"
    extraInstructions?: string;
}

export interface IPromptPayload {
    type: ContentType;
    history: IPromptHistoryItem[];
    current: IPromptCurrentRequest;
}

export interface IAiPrompt {
    contentPrompt: string;
    titlePrompt: string;
    expectedResponseFormat?: string;
}
