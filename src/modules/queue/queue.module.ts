import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QueueName } from './enums/queue.enum';
import { QueueProcessor } from './queue.processor';
import { QueueService } from './queue.service';

@Module({
    imports: [
        ConfigModule,
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
    ],
    providers: [QueueService, QueueProcessor],
    exports: [QueueService, BullModule],
})
export class QueueModule { }
