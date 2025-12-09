import { Document, Types } from "mongoose";
import { UserType } from "src/common/enums/user.enum";

export interface IUser extends Document {
    _id: Types.ObjectId;
    name: string;
    email: string;
    password: string;
    userType: UserType;
    createdAt?: Date;
    updatedAt?: Date;
    sentiment?: string;
}