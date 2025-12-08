import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosHelper } from 'src/common/helpers/axios.helper';
import { IAiPrompt } from 'src/interfaces/prompt.interface';
import { ContentStatus } from '../../content/enums/content.enum';
import { IAIContentResponse, IAIProvider } from '../interfaces/ai-provider.interface';

@Injectable()
export class OpenRouterProvider implements IAIProvider {
    private readonly logger = new Logger(OpenRouterProvider.name);
    private readonly apiKey: string;
    private readonly siteUrl: string;
    private readonly siteName: string;
    private readonly apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
    private readonly axiosHelper: AxiosHelper;

    constructor(private readonly configService: ConfigService) {

        this.apiKey = this.configService.get<string>('OPENROUTER_API_KEY') || '';
        this.siteUrl = this.configService.get<string>('OPENROUTER_SITE_URL') || 'https://ai-content-studio.com';
        this.siteName = this.configService.get<string>('OPENROUTER_SITE_NAME') || 'AI Content Studio';
        this.axiosHelper = AxiosHelper.getInstance();

        if (!this.apiKey) {
            this.logger.error('OPENROUTER_API_KEY is not configured in environment variables');
        }

        this.logger.log(`OpenRouter provider initialized with API key: ${this.apiKey.substring(0, 10)}...`);
    }

    // Generate content using OpenRouter API based on aiPrompt (single call with structured response)
    async generateContent(
        aiPrompt: IAiPrompt,
        model: string = 'openai/gpt-4o',
    ): Promise<IAIContentResponse> {

        const max_tokens = 1000;
        try {
            if (!this.apiKey) {
                throw new Error('OPENROUTER_API_KEY is not configured');
            }

            this.logger.log(`Generating content with OpenRouter model: ${model}`);

            // Combined prompt

            let combinedPrompt = `${aiPrompt.contentPrompt}\n\n${aiPrompt.titlePrompt}`;

            if (aiPrompt.expectedResponseFormat) {
                combinedPrompt += `\n\nPlease respond in JSON format:\n${aiPrompt.expectedResponseFormat}`;
            }

            const requestBody: any = {
                model: model,
                messages: [
                    {
                        role: 'user',
                        content: combinedPrompt,
                    },
                ],
                max_tokens: max_tokens,
            };

            if (aiPrompt.expectedResponseFormat) {
                requestBody.response_format = { type: 'json_object' };
            }

            const responseData = await this.axiosHelper.post(
                this.apiUrl,
                requestBody,
                {
                    headers: {
                        Authorization: `Bearer ${this.apiKey}`,
                        'HTTP-Referer': this.siteUrl,
                        'X-Title': this.siteName,
                    },
                },
            );

            const responseText = responseData.choices?.[0]?.message?.content || '';

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
        } catch (error) {
            this.logger.error(`Error generating content with OpenRouter: ${error.message}`, error.stack);
            return { content: '', title: '', status: ContentStatus.FAILED };
        }
    }


}
