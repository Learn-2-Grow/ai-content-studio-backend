import { Controller, Query, Sse, UseFilters } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';
import { SseService } from './sse.service';

@Controller('sse')
@UseFilters(HttpExceptionFilter)
export class SseController {
    constructor(private readonly sseService: SseService) { }

    // TODO: Add auth guard
    @Sse('stream')
    stream(@Query('userId') userId: string): Observable<MessageEvent> {
        return this.sseService.subscribe(userId).pipe(
            map((payload) => {
                return { data: JSON.stringify(payload) } as MessageEvent;
            }),
        );
    }
}
