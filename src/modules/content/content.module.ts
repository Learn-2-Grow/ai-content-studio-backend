import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SseModule } from '../../sse/sse.module';
import { AIModule } from '../ai/ai.module';
import { QueueModule } from '../queue/queue.module';
import { ThreadModule } from '../thread/thread.module';
import { UserModule } from '../user/user.module';
import { ContentController } from './content.controller';
import { ContentRepository } from './content.repository';
import { ContentService } from './content.service';
import { Content, ContentSchema } from './entities/content.entity';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Content.name, schema: ContentSchema }]),
        ThreadModule,
        UserModule,
        SseModule,
        forwardRef(() => QueueModule),
        forwardRef(() => AIModule),
    ],
    controllers: [ContentController],
    providers: [ContentService, ContentRepository],
    exports: [ContentService, ContentRepository],
})
export class ContentModule { }
