import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserType } from '../enums/user.enum';


@Schema({
    timestamps: true, // Automatically adds createdAt and updatedAt
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
}

export const UserSchema = SchemaFactory.createForClass(User);
