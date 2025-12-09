import { Types } from 'mongoose';
import { IUser } from 'src/common/interfaces/user.interface';
import { CreateUserDto } from 'src/modules/user/dtos/user.dto';
import { UserType } from 'src/common/enums/user.enum';

export const mockUser: IUser = {
    _id: new Types.ObjectId(),
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword123',
    userType: UserType.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
    sentiment: 'positive',
    toObject: jest.fn().mockReturnValue({
        _id: new Types.ObjectId(),
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword123',
        userType: UserType.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
        sentiment: 'positive',
    }),
} as any;

export const mockCreateUserDto: CreateUserDto = {
    name: 'New User',
    email: 'newuser@example.com',
    password: 'password123',
};
