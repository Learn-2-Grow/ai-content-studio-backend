import { IUser } from "./user.interface";

export interface IAuthResponse {
    user?: Pick<IUser, '_id' | 'name' | 'email'>;
    tokens?: {
        accessToken: string;
        refreshToken: string;
    };
}