import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../../modules/auth/auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        private authService: AuthService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET'),
        });
    }

    async validate(payload: any) {
        // Passport JWT already verified the token signature and expiration
        // We only need to verify the user still exists in the database
        const user = await this.authService.validateUser(payload.sub);
        if (!user) {
            throw new UnauthorizedException('User not found or inactive');
        }

        // Return user object that will be attached to request.user
        // This matches what the controllers expect
        return user;
    }
}
