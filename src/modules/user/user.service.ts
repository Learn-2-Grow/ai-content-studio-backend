import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserType } from 'src/common/enums/user.enum';
import { IUser } from 'src/common/interfaces/user.interface';
import { ExceptionHelper } from '../../common/helpers/exceptions.helper';
import { CreateUserDto } from './dtos/user.dto';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);

    constructor(
        private userRepository: UserRepository,
    ) { }


    async findById(userId: string): Promise<IUser | null> {
        const result = await this.userRepository.findById(userId);
        return result ? result.toObject() : null;
    }

    async isActiveByEmail(email: string): Promise<IUser | null> {
        const user: IUser | null = await this.userRepository.findByEmail(email);
        return user
            ? user
            : null;
    }

    async create(createUserDto: CreateUserDto): Promise<IUser> {

        const existingUser = await this.userRepository.findByEmail(createUserDto.email);
        if (existingUser) {
            ExceptionHelper.getInstance().defaultError('User already exists', 'USER_ALREADY_EXISTS', HttpStatus.CONFLICT);
        }

        const hashedPassword = await this.hashPassword(createUserDto.password);

        const userObject: Partial<IUser> = {
            name: createUserDto?.name?.trim() || '',
            email: createUserDto?.email?.trim() || '',
            password: hashedPassword,
            userType: UserType.USER,
        }
        const user: IUser = await this.userRepository.create(userObject);

        return user;
    }

    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    }
    async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
    }

    async me(user: IUser): Promise<IUser> {

        const userData: IUser | null = await this.userRepository.findById(user._id.toString());
        let sanitizeUser: Partial<IUser> | null = null;
        if (userData) {
            sanitizeUser = {
                _id: userData._id,
                name: userData.name,
                email: userData.email,
                sentiment: userData.sentiment,
            }
        }

        return sanitizeUser as IUser;
    }
}
