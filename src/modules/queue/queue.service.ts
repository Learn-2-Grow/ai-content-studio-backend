import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bull';
import { QueueName } from './enums/queue.enum';

@Injectable()
export class QueueService implements OnModuleInit {
    private readonly logger = new Logger(QueueService.name);

    constructor(
        @InjectQueue(QueueName.CONTENT_GENERATION) private readonly contentGeneration: Queue,
        private readonly configService: ConfigService,
    ) { }

    onModuleInit() {

        const redisUrl = this.configService.get<string>('REDIS_URL');
        this.logger.log(`Initializing Bull Queue with redis url: ${redisUrl}`);

        this.contentGeneration.on('ready', () => {
            this.logger.log('Bull Queue connected to Redis successfully');
        });

        this.contentGeneration.on('error', (error) => {
            this.logger.error('Bull Queue connection error');
        });

        const client = (this.contentGeneration as any).client;
        if (client) {
            client.on('connect', () => {
                this.logger.log('Redis client connecting...');
            });

            client.on('ready', () => {
                this.logger.log('Redis client ready');
            });

            client.on('error', (error: Error) => {
                this.logger.error(`Redis client error: ${error.message}`);
            });

            client.on('end', () => {
                this.logger.warn('Redis client connection ended');
            });

            client.on('reconnecting', () => {
                this.logger.log('Redis client reconnecting...');
            });
        }

        this.contentGeneration.isReady().then(() => {
            this.logger.log('Bull Queue is ready');
        }).catch((error) => {
            this.logger.error(`Bull Queue initialization failed: ${error.message}`);
        });
    }

    async addJob<T = any>(
        jobName: string,
        data: T,
        options?: {
            delay?: number;
            attempts?: number;
            priority?: number;
            removeOnComplete?: boolean | number;
            removeOnFail?: boolean | number;
        },
    ) {
        return await this.contentGeneration.add(jobName, data, options);
    }

    async getJob(jobId: string) {
        return await this.contentGeneration.getJob(jobId);
    }

    async getJobs(status?: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed') {
        if (status) {
            return await this.contentGeneration.getJobs([status], 0, -1);
        }
        return await this.contentGeneration.getJobs(['waiting', 'active', 'completed', 'failed', 'delayed'], 0, -1);
    }

    async removeJob(jobId: string) {
        const job = await this.contentGeneration.getJob(jobId);
        if (job) {
            await job.remove();
        }
    }


    async clean(grace: number = 1000, limit: number = 100) {
        const [completed, failed] = await Promise.all([
            this.contentGeneration.clean(grace, 'completed', limit),
            this.contentGeneration.clean(grace, 'failed', limit),
        ]);

        return {
            completed: completed.length,
            failed: failed.length,
        };
    }


}
