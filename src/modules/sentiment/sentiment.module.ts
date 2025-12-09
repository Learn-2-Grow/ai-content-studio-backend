import { Module } from '@nestjs/common';
import { AIModule } from '../ai/ai.module';
import { ContentModule } from '../content/content.module';
import { SentimentController } from './sentiment.controller';
import { SentimentService } from './sentiment.service';

@Module({
    imports: [ContentModule, AIModule],
    providers: [SentimentService],
    exports: [SentimentService],
    controllers: [SentimentController],
})
export class SentimentModule { }
