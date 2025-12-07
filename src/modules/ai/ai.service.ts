import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProvider } from 'src/common/enums/ai-provider.enum';
import { IAIContentResponse, IAIProvider } from './interfaces/ai-provider.interface';
import { GeminiProvider } from './providers/gemini.provider';
import { OpenRouterProvider } from './providers/openrouter.provider';

@Injectable()
export class AIService {
    private readonly logger = new Logger(AIService.name);
    private readonly provider: IAIProvider;
    private readonly openRouterModel: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly geminiProvider: GeminiProvider,
        private readonly openRouterProvider: OpenRouterProvider,
    ) {
        const providerType = (this.configService.get<string>('AI_PROVIDER') || AIProvider.GEMINI) as AIProvider;
        this.openRouterModel = this.configService.get<string>('OPENROUTER_MODEL') || 'openai/gpt-4o';
        this.provider = providerType === AIProvider.OPENROUTER ? this.openRouterProvider : this.geminiProvider;
        this.logger.log(`AI Service initialized with ${providerType}`);
    }

    async generateContent(prompt: string, model?: string): Promise<IAIContentResponse> {
        const modelToUse = this.provider === this.openRouterProvider ? model || this.openRouterModel : model;
        return this.provider.generateContent(prompt, modelToUse);
    }

    async generateContentWithTitle(contentPrompt: string, titlePrompt: string, model?: string): Promise<IAIContentResponse> {
        const modelToUse = this.provider === this.openRouterProvider ? model || this.openRouterModel : model;
        return this.provider.generateContentWithTitle(contentPrompt, titlePrompt, modelToUse);
    }
}
