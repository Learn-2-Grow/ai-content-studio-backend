import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { QueueName, QueueProcess } from './enums/queue.enum';

@Processor(QueueName.CONTENT_GENERATION)
export class QueueProcessor {
    private readonly logger = new Logger(QueueProcessor.name);

    @Process(QueueProcess.GENERATE_CONTENT)
    async handleGenerateContentJob(job: Job) {
        this.logger.log(`Processing generate content job ${job.id}`);
    }

}
