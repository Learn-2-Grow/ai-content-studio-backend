import { GoogleGenerativeAI } from '@google/generative-ai';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeminiModel } from 'src/common/enums/gemini.enum';
import { ExceptionHelper } from 'src/common/helpers/exceptions.helper';
import { ContentStatus } from '../../content/enums/content.enum';
import { IAIProvider, IAIContentResponse } from '../interfaces/ai-provider.interface';

@Injectable()
export class GeminiProvider implements IAIProvider {
    private readonly logger = new Logger(GeminiProvider.name);
    private readonly genAI: GoogleGenerativeAI;

    constructor(private readonly configService: ConfigService) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (!apiKey) {
            this.logger.error('GEMINI_API_KEY is not configured');
            ExceptionHelper.getInstance().defaultError(
                'GEMINI_API_KEY is not configured',
                'GEMINI_API_KEY_NOT_CONFIGURED',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        this.genAI = new GoogleGenerativeAI(apiKey);
        this.logger.log('Gemini provider initialized');
    }

    async generateContent(
        prompt: string,
        model?: string,
    ): Promise<IAIContentResponse> {
        try {
            const geminiModel = model || GeminiModel.GEMINI_1_5_FLASH;
            const aiModel = this.genAI.getGenerativeModel({ model: geminiModel });

            this.logger.log(`Generating content with Google Gemini (${geminiModel})`);

            const result = await aiModel.generateContent(prompt);
            const content = result.response.text();
            const title = content.split(/[.!?]/)[0]?.trim() || content.substring(0, 50);

            this.logger.log(`Content generated successfully (${content.length} characters)`);

            return { content, title, status: ContentStatus.COMPLETED };
        } catch (error) {
            this.logger.error(`Error generating content: ${error.message}`, error.stack);
            return { content: '', title: '', status: ContentStatus.FAILED };
        }
    }

    async generateContentWithTitle(
        contentPrompt: string,
        titlePrompt: string,
        model?: string,
    ): Promise<IAIContentResponse> {
        // For Gemini, generate content and extract title
        const result = await this.generateContent(contentPrompt, model);
        // You could also generate title separately with Gemini if needed
        return result;
    }
}
