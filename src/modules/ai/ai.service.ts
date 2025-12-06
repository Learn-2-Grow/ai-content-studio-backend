import { GoogleGenerativeAI } from '@google/generative-ai';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExceptionHelper } from 'src/common/helpers/exceptions.helper';
import { ContentStatus } from '../content/enums/content.enum';

@Injectable()
export class AIService {
    private readonly logger = new Logger(AIService.name);
    private readonly genAI: GoogleGenerativeAI;

    constructor(private readonly configService: ConfigService) {

        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (!apiKey) {
            this.logger.error('GEMINI_API_KEY is not configured');
            ExceptionHelper.getInstance().defaultError('GEMINI_API_KEY is not configured', 'GEMINI_API_KEY_NOT_CONFIGURED', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        this.genAI = new GoogleGenerativeAI(apiKey);
        this.logger.log('AI Service initialized with Google Gemini');
    }

    /**
     * Generates content using Google Gemini API with the provided prompt.
     * The prompt should already be enhanced with context and type-specific instructions.
     * Uses gemini-2.0-flash model for faster responses.
     */
    async generateContent(prompt: string): Promise<{ content: string, title: string, status: ContentStatus }> {
        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

            this.logger.log('Generating content with Google Gemini (gemini-2.0-flash)');

            const result = await model.generateContent(prompt);
            const response = result.response;
            const generatedText = response.text();
            const title = response.text();

            this.logger.log(`Content generated successfully (${generatedText.length} characters)`);
            return {
                content: generatedText,
                title: title,
                status: ContentStatus.COMPLETED,
            }

        } catch (error) {
            this.logger.error(`Error generating content: ${error.message}`, error.stack);

            return {
                content: '',
                title: '',
                status: ContentStatus.FAILED,
            }
        }
    }
}
