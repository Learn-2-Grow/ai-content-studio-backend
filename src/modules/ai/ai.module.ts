import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AIService } from './ai.service';
import { GeminiProvider } from './providers/gemini.provider';
import { OpenRouterProvider } from './providers/openrouter.provider';

@Module({
    imports: [ConfigModule],
    providers: [AIService, GeminiProvider, OpenRouterProvider],
    exports: [AIService],
})
export class AIModule { }
