import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { IUser } from 'src/interfaces/user.interface';
import { ExceptionHelper } from '../../common/helpers/exceptions.helper';
import { CreateUserDto } from './dtos/user.dto';
import { UserType } from './enums/user.enum';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);

    constructor(
        private userRepository: UserRepository,
    ) { }


    async findById(userId: string): Promise<IUser | null> {
        return this.userRepository.findById(userId);
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

        // Hash password
        const hashedPassword = await this.hashPassword(createUserDto.password);

        // Create user object
        const userObject: Partial<IUser> = {
            name: createUserDto?.name?.trim() || '',
            email: createUserDto?.email?.trim() || '',
            password: hashedPassword,
            userType: UserType.USER,
        }
        const user: IUser = await this.userRepository.create(userObject);

        return user;
    }

    async updateSentiment(userId: string, sentiment: string): Promise<void> {
        await this.userRepository.update(userId, { sentiment });
    }

    async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, 10);
    }
    async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(password, hashedPassword);
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
