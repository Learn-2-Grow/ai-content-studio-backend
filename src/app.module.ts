import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { ContentModule } from './modules/content/content.module';
import { DatabaseModule } from './modules/database/database.module';
import { QueueModule } from './modules/queue/queue.module';
import { SentimentModule } from './modules/sentiment/sentiment.module';
import { SseModule } from './modules/sse/sse.module';
import { ThreadModule } from './modules/thread/thread.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    AuthModule,
    QueueModule,
    ThreadModule,
    ContentModule,
    SseModule,
    SentimentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
