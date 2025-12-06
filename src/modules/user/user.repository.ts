import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { IUser } from "src/interfaces/user.interface";
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
    async findById(id: string): Promise<IUser | null> {
        return this.userModel.findById(id).exec();
    }
    async update(id: string, user: Partial<IUser>): Promise<IUser | null> {
        return this.userModel.findByIdAndUpdate(id, user, { new: true }).exec();
    }
    async delete(id: string): Promise<IUser | null> {
        return this.userModel.findByIdAndDelete(id).exec();
    }
    async findAll(): Promise<IUser[]> {
        return this.userModel.find().exec();
    }
}