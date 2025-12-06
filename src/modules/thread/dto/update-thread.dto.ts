import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ContentType } from '../enums/thread.enum';
import { ThreadStatus } from '../enums/thread.enum';

export class UpdateThreadDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsEnum(ContentType)
    type?: ContentType;

    @IsOptional()
    @IsEnum(ThreadStatus)
    status?: ThreadStatus;
}
