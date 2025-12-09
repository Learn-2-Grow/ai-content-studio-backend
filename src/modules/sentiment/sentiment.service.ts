import { Injectable, Logger } from '@nestjs/common';
import { SentimentType } from 'src/common/enums/sentiment.enum';
import { IAiPrompt } from 'src/common/interfaces/prompt.interface';
import { IUser } from 'src/common/interfaces/user.interface';
import { AIService } from '../ai/ai.service';
import { ContentService } from '../content/content.service';
import { AnalysisDto } from './dtos/analysis.dto';

@Injectable()
export class SentimentService {
    private readonly logger = new Logger(SentimentService.name);

    constructor(
        private readonly contentService: ContentService,
        private readonly aiService: AIService,
    ) { }

    async analyzeSentiment(user: IUser, body: AnalysisDto): Promise<{ sentiment: string }> {
        await this.contentService.findOne(body.contentId, user._id.toString());

        const aiPrompt: IAiPrompt = {
            contentPrompt: `Analyze the sentiment of the following text and respond with only one word: "positive", "negative", or "neutral".\n\nText: ${body.prompt}`,
            titlePrompt: '',
            expectedResponseFormat: '{"sentiment": "positive|negative|neutral"}',
        };

        const aiResponse = await this.aiService.generateContent(aiPrompt);
        const sentiment = this.extractSentiment(aiResponse.content);

        await this.contentService.update(body.contentId, { sentiment });

        return { sentiment };
    }

    private extractSentiment(content: string): SentimentType {
        const normalized = content.toLowerCase().trim();
        if (normalized.includes('positive')) return SentimentType.POSITIVE;
        if (normalized.includes('negative')) return SentimentType.NEGATIVE;
        return SentimentType.NEUTRAL;
    }
}
