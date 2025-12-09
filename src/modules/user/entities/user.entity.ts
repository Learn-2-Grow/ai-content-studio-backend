import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserType } from 'src/common/enums/user.enum';

export type UserDocument = User & Document;

@Schema({
    timestamps: true,
})
export class User {
    @Prop({ required: true, trim: true })
    name: string;

    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: true, enum: UserType })
    userType: UserType;

    @Prop({ required: false, trim: true })
    sentiment: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
