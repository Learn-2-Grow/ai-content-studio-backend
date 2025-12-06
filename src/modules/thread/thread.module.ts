import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Thread, ThreadSchema } from './entities/thread.entity';
import { ThreadController } from './thread.controller';
import { ThreadRepository } from './thread.repository';
import { ThreadService } from './thread.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Thread.name, schema: ThreadSchema }]),
    ],
    controllers: [ThreadController],
    providers: [ThreadService, ThreadRepository],
    exports: [ThreadService, ThreadRepository],
})
export class ThreadModule { }
