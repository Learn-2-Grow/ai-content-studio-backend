import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { NestHelper } from "src/common/helpers/nest.helper";
import { IUser } from "src/common/interfaces/user.interface";
import { User, UserDocument } from "./entities/user.entity";


export class UserRepository {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>) { }

    async create(user: Partial<IUser>): Promise<IUser> {
        const userDoc = await this.userModel.create(user);

        return userDoc;
    }
    async findByEmail(email: string): Promise<IUser | null> {
        return this.userModel.findOne({ email }).exec();
    }
    async findById(id: any): Promise<IUser | null> {

        const userId = NestHelper.getInstance().getObjectId(id);
        return this.userModel.findById(userId).exec();
    }
    async update(id: any, user: Partial<IUser>): Promise<IUser | null> {
        const userId = NestHelper.getInstance().getObjectId(id);
        return this.userModel.findByIdAndUpdate(userId, user, { new: true }).exec();
    }
    async delete(id: string): Promise<IUser | null> {
        return this.userModel.findByIdAndDelete(id).exec();
    }
    async findAll(): Promise<IUser[]> {
        return this.userModel.find().exec();
    }
}