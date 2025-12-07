import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ContentType } from '../../thread/enums/thread.enum';

export class GenerateContentDto {
    @IsNotEmpty()
    @IsString()
    prompt: string;

    @IsNotEmpty()
    @IsEnum(ContentType)
    contentType: ContentType;

    @IsOptional()
    @IsString()
    threadId?: string;
}
