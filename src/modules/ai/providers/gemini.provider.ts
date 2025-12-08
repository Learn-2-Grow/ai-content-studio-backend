import { GoogleGenerativeAI } from '@google/generative-ai';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeminiModel } from 'src/common/enums/gemini.enum';
import { ExceptionHelper } from 'src/common/helpers/exceptions.helper';
import { IAiPrompt } from 'src/interfaces/prompt.interface';
import { ContentStatus } from '../../content/enums/content.enum';
import { IAIContentResponse, IAIProvider } from '../interfaces/ai-provider.interface';

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
        aiPrompt: IAiPrompt,
        model?: string,
    ): Promise<IAIContentResponse> {
        try {
            const geminiModel = model || GeminiModel.GEMINI_2_FLASH || GeminiModel.GEMINI_1_0_FLASH_LATEST;
            const maxOutputTokens = 1000;

            // Combined prompt
            const combinedPrompt = `${aiPrompt.contentPrompt}\n\n${aiPrompt.titlePrompt}${aiPrompt.expectedResponseFormat ? `\n\n${aiPrompt.expectedResponseFormat}` : ''}`;

            const generationConfig: any = {
                maxOutputTokens: maxOutputTokens,
            };

            if (aiPrompt.expectedResponseFormat) {
                generationConfig.responseMimeType = 'application/json';
            }

            const aiModel = this.genAI.getGenerativeModel({
                model: geminiModel,
                generationConfig,
            });

            this.logger.log(`Generating content with Google Gemini (${geminiModel})`);

            const result = await aiModel.generateContent(combinedPrompt);
            const responseText = result.response.text();

            if (aiPrompt.expectedResponseFormat) {
                try {
                    const parsedResponse = JSON.parse(responseText);
                    const content = parsedResponse.content || '';
                    const title = parsedResponse.title || content.split(/[.!?]/)[0]?.trim() || content.substring(0, 50);

                    this.logger.log(`Content generated successfully (${content.length} characters)`);
                    return { content, title, status: ContentStatus.COMPLETED };
                } catch (parseError) {
                    this.logger.warn(`Failed to parse JSON response, falling back to text parsing: ${parseError.message}`);
                }
            }

            // Fallback: extract from text response
            const content = responseText;
            const title = content.split(/[.!?]/)[0]?.trim() || content.substring(0, 50);

            this.logger.log(`Content generated successfully (${content.length} characters)`);

            return { content, title, status: ContentStatus.COMPLETED };
        } catch (error: any) {
            this.logger.error(`Error generating content: ${error.message}`, error.stack);
            return { content: '', title: '', status: ContentStatus.FAILED };
        }
    }
}
