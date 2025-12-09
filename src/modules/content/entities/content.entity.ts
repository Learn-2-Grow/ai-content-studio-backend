import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ContentStatus } from 'src/common/enums/content.enum';
import { SentimentType } from 'src/common/enums/sentiment.enum';

export type ContentDocument = Content & Document;

@Schema({
    timestamps: true,
})
export class Content {
    @Prop({ required: true, ref: 'Thread' })
    threadId: string;

    @Prop({ required: true, trim: true })
    prompt: string;

    @Prop({ default: '' })
    generatedContent: string;

    @Prop({ required: true, enum: ContentStatus, default: ContentStatus.PENDING })
    status: ContentStatus;

    @Prop({ default: Date.now })
    statusUpdatedAt: Date;


    @Prop({ default: 'neutral' })
    sentiment: SentimentType;
}

export const ContentSchema = SchemaFactory.createForClass(Content);
