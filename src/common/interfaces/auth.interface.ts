import { IUser } from "./user.interface";

export interface IAuthResponse {
    user?: Pick<IUser, '_id' | 'name' | 'email'>;
    tokens?: {
        access: string;
        refresh: string;
    };
}