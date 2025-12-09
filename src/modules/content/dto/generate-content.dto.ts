import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AIProvider } from 'src/common/enums/ai-provider.enum';
import { ContentType } from 'src/common/enums/thread.enum';

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
    @IsOptional()
    @IsEnum(AIProvider)
    provider?: AIProvider;
}
