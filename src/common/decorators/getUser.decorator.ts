import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IUser } from 'src/common/interfaces/user.interface';

export const GetUser = createParamDecorator((data, ctx: ExecutionContext): IUser => {
    const req = ctx.switchToHttp().getRequest();
    // const user = req.user
    return req.user;
});
