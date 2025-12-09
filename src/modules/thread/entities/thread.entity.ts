import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ContentType, ThreadStatus } from 'src/common/enums/thread.enum';

export type ThreadDocument = Thread & Document;

@Schema({
    timestamps: true,
})
export class Thread {
    @Prop({ required: true, ref: 'User' })
    userId: string;

    @Prop({ required: true, trim: true })
    title: string;

    @Prop({ required: true, enum: ContentType })
    type: ContentType;

    @Prop({ required: true, enum: ThreadStatus, default: ThreadStatus.ACTIVE })
    status: ThreadStatus;
}

export const ThreadSchema = SchemaFactory.createForClass(Thread);
