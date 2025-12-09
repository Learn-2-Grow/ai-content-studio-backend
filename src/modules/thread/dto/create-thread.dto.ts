import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ContentType, ThreadStatus } from 'src/common/enums/thread.enum';

export class CreateThreadDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsEnum(ContentType)
    type: ContentType;

    @IsOptional()
    @IsEnum(ThreadStatus)
    status?: ThreadStatus;

    // @IsNotEmpty()
    // @IsString()
    // @IsMongoId()
    // userId: string;
}
