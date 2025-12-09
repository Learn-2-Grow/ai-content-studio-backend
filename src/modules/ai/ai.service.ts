import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProvider } from 'src/common/enums/ai-provider.enum';
import { IAIContentResponse, IAIProvider } from 'src/common/interfaces/ai-provider.interface';
import { IAiPrompt } from 'src/common/interfaces/prompt.interface';
import { GeminiProvider } from './providers/gemini.provider';
import { OpenRouterProvider } from './providers/openrouter.provider';

@Injectable()
export class AIService {

    private readonly logger = new Logger(AIService.name);
    private readonly defaultProvider: IAIProvider;
    private readonly openRouterModel: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly geminiProvider: GeminiProvider,
        private readonly openRouterProvider: OpenRouterProvider,
    ) {
        const providerType = (this.configService.get<string>('AI_PROVIDER') || AIProvider.GEMINI) as AIProvider;
        this.openRouterModel = this.configService.get<string>('OPENROUTER_MODEL') || 'openai/gpt-4o';
        this.defaultProvider = providerType === AIProvider.OPENROUTER ? this.openRouterProvider : this.geminiProvider;
        this.logger.log(`AI Service initialized with default provider: ${providerType}`);
    }

    // Generate content with the selected provider
    async generateContent(
        aiPrompt: IAiPrompt,
        provider?: AIProvider,
        model?: string,
    ): Promise<IAIContentResponse> {

        const providerInstance = this.getProvider(provider || AIProvider.OPENROUTER);

        const aiResponse = await providerInstance.generateContent(aiPrompt, model);
        return aiResponse;
    }

    getProvider(provider: AIProvider): IAIProvider {
        switch (provider) {
            case AIProvider.GEMINI:
                return this.geminiProvider;
            case AIProvider.OPENROUTER:
                return this.openRouterProvider;
            default:
                return this.openRouterProvider;
        }
    }
}
