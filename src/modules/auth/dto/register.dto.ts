import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { IsPasswordValid } from '../../../common/validators/custom.validator';

export class RegisterDto {
    @IsNotEmpty({ message: 'Name is required' })
    @IsString({ message: 'Name must be a string' })
    name: string;

    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Email must be a valid email address' })
    email: string;

    @IsNotEmpty({ message: 'Password is required' })
    @IsString({ message: 'Password must be a string' })
    @IsPasswordValid({ message: 'Password must be at least 6 characters long and contain at least one alphabet and one number' })
    password: string;
}
