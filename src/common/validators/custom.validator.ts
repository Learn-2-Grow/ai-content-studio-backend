import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

export class CustomValidator {
    static validateEmail(email: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    static validatePassword(password: string): boolean {
        // Password must be at least 6 characters and contain at least one alphabet and one number
        if (password?.length < 6) {
            return false;
        }
        const hasAlphabet = /[a-zA-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        return hasAlphabet && hasNumber;
    }
}

// Custom validator decorator for password
export function IsPasswordValid(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isPasswordValid',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions || {
                message: 'Password must be at least 6 characters long and contain at least one alphabet and one number',
            },
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return typeof value === 'string' && CustomValidator.validatePassword(value);
                },
            },
        });
    };
}
