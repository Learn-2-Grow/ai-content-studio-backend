import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ContentStatus } from '../../content/enums/content.enum';
import { IAIContentResponse, IAIProvider } from '../interfaces/ai-provider.interface';

@Injectable()
export class OpenRouterProvider implements IAIProvider {
    private readonly logger = new Logger(OpenRouterProvider.name);
    private readonly apiKey: string;
    private readonly siteUrl: string;
    private readonly siteName: string;
    private readonly apiUrl = 'https://openrouter.ai/api/v1/chat/completions';

    constructor(private readonly configService: ConfigService) {
        this.apiKey = this.configService.get<string>('OPENROUTER_API_KEY') || '';
        this.siteUrl = this.configService.get<string>('OPENROUTER_SITE_URL') || 'https://ai-content-studio.com';
        this.siteName = this.configService.get<string>('OPENROUTER_SITE_NAME') || 'AI Content Studio';

        if (!this.apiKey) {
            this.logger.error('OPENROUTER_API_KEY is not configured in environment variables');
        }

        this.logger.log(`OpenRouter provider initialized with API key: ${this.apiKey.substring(0, 10)}...`);
    }

    /**
     * Generates content using OpenRouter REST API with any available model.
     * @param prompt - The prompt to send to the model
     * @param model - The model identifier (e.g., 'openai/gpt-4o', 'anthropic/claude-3.5-sonnet', 'google/gemini-pro')
     * @returns Generated content response
     */
    async generateContent(
        prompt: string,
        model: string = 'openai/gpt-4o',
    ): Promise<IAIContentResponse> {
        try {
            if (!this.apiKey) {
                throw new Error('OPENROUTER_API_KEY is not configured');
            }

            this.logger.log(`Generating content with OpenRouter model: ${model}`);

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'HTTP-Referer': this.siteUrl,
                    'X-Title': this.siteName,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        {
                            role: 'user',
                            content: prompt,
                        },
                    ],
                    max_tokens: 8000,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            const content = data.choices?.[0]?.message?.content || '';
            const title = content.split(/[.!?]/)[0]?.trim() || content.substring(0, 50);

            this.logger.log(`Content generated successfully (${content.length} characters)`);

            return { content, title, status: ContentStatus.COMPLETED };
        } catch (error) {
            this.logger.error(`Error generating content with OpenRouter: ${error.message}`, error.stack);
            return { content: '', title: '', status: ContentStatus.FAILED };
        }
    }

    /**
     * Generates both content and title using separate prompts
     */
    async generateContentWithTitle(
        contentPrompt: string,
        titlePrompt: string,
        model: string = 'openai/gpt-4o',
    ): Promise<IAIContentResponse> {
        try {
            if (!this.apiKey) {
                throw new Error('OPENROUTER_API_KEY is not configured');
            }

            this.logger.log(`Generating content and title with OpenRouter model: ${model}`);

            const headers = {
                Authorization: `Bearer ${this.apiKey}`,
                'HTTP-Referer': this.siteUrl,
                'X-Title': this.siteName,
                'Content-Type': 'application/json',
            };

            // Generate content and title in parallel
            const [contentResponse, titleResponse] = await Promise.all([
                fetch(this.apiUrl, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        model: model,
                        messages: [
                            {
                                role: 'user',
                                content: contentPrompt,
                            },
                        ],
                        max_tokens: 8000,
                    }),
                }),
                fetch(this.apiUrl, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        model: model,
                        messages: [
                            {
                                role: 'user',
                                content: titlePrompt,
                            },
                        ],
                        max_tokens: 200,
                    }),
                }),
            ]);

            if (!contentResponse.ok || !titleResponse.ok) {
                const contentError = contentResponse.ok ? '' : await contentResponse.text();
                const titleError = titleResponse.ok ? '' : await titleResponse.text();
                throw new Error(`OpenRouter API error - Content: ${contentError}, Title: ${titleError}`);
            }

            const [contentData, titleData] = await Promise.all([
                contentResponse.json(),
                titleResponse.json(),
            ]);

            const content = contentData.choices?.[0]?.message?.content || '';
            const title = titleData.choices?.[0]?.message?.content?.trim() || content.split(/[.!?]/)[0]?.trim() || '';

            this.logger.log(`Content and title generated successfully`);

            return { content, title, status: ContentStatus.COMPLETED };
        } catch (error) {
            this.logger.error(`Error generating content with OpenRouter: ${error.message}`, error.stack);
            return { content: '', title: '', status: ContentStatus.FAILED };
        }
    }
}
