import { IsEnum, IsOptional, IsString } from "class-validator";
import { ContentType, ThreadStatus } from "../enums/thread.enum";

export class ThreadQueriesDto {
    @IsOptional()
    @IsString()
    threadIds?: string[];

    @IsOptional()
    @IsString()
    userId?: string;

    @IsOptional()
    @IsString()
    sortOrder?: string;

    @IsOptional()
    currentPage?: string | number;

    @IsOptional()
    pageSize?: string | number;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsEnum(ThreadStatus)
    status?: ThreadStatus;

    @IsOptional()
    @IsEnum(ContentType)
    type?: ContentType;

}   