import { Document } from "mongoose";
import { UserType } from "src/modules/user/enums/user.enum";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    userType: UserType;
    createdAt: Date;
    updatedAt: Date;
}