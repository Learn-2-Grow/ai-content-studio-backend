import { BullModule } from '@nestjs/bull';
import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AIModule } from '../ai/ai.module';
import { ContentModule } from '../content/content.module';
import { Content, ContentSchema } from '../content/entities/content.entity';
import { QueueName } from 'src/common/enums/queue.enum';
import { QueueProcessor } from './queue.processor';
import { QueueService } from './queue.service';

@Module({
    imports: [
        ConfigModule,
        MongooseModule.forFeature([{ name: Content.name, schema: ContentSchema }]),
        AIModule,
        BullModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => {
                const redisUrl = configService.get<string>('REDIS_URL');

                return {
                    redis: redisUrl,
                };
            },
            inject: [ConfigService],
        }),
        BullModule.registerQueue({
            name: QueueName.CONTENT_GENERATION,
        }),
        forwardRef(() => ContentModule),
    ],
    providers: [QueueService, QueueProcessor],
    exports: [QueueService, BullModule],
})
export class QueueModule { }
