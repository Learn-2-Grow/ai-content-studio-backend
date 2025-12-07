import { Document, Types } from 'mongoose';
import { ContentType, ThreadStatus } from 'src/modules/thread/enums/thread.enum';
import { IContent } from './content.interface';

export interface IThread extends Document {
    _id: Types.ObjectId;
    userId: string | Types.ObjectId;
    title: string;
    type: ContentType;
    status: ThreadStatus;
    createdAt?: Date;
    updatedAt?: Date;
    contents?: IContent[];
    lastContent?: IContent;
}
