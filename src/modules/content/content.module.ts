import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AIModule } from '../ai/ai.module';
import { QueueModule } from '../queue/queue.module';
import { ThreadModule } from '../thread/thread.module';
import { ContentController } from './content.controller';
import { ContentRepository } from './content.repository';
import { ContentService } from './content.service';
import { Content, ContentSchema } from './entities/content.entity';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Content.name, schema: ContentSchema }]),
        ThreadModule,
        forwardRef(() => QueueModule),
        forwardRef(() => AIModule),
    ],
    controllers: [ContentController],
    providers: [ContentService, ContentRepository],
    exports: [ContentService, ContentRepository],
})
export class ContentModule { }
