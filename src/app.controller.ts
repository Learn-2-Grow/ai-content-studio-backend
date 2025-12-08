import { Controller, Get, UseFilters } from '@nestjs/common';
import { AppService } from './app.service';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

@Controller()
@UseFilters(HttpExceptionFilter)
export class AppController {

  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): object {
    return this.appService.getHello();
  }
}
