import { Model } from "mongoose";
import { IUser } from "../../interfaces/user.interface";


export class UserRepository {
    constructor(private readonly userModel: Model<IUser>) { }

    async create(user: Partial<IUser>): Promise<IUser> {
        return this.userModel.create(user);
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