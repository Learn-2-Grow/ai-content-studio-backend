import { IsEnum, IsNotEmpty } from 'class-validator';
import { SentimentType } from 'src/common/enums/sentiment.enum';

export class UpdateContentDto {
    @IsNotEmpty()
    @IsEnum(SentimentType)
    sentiment: SentimentType;
}
