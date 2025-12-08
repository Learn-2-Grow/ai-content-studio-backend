import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): object {
    return {
      message: 'AI Content Studio API is running!',
      version: '0.0.1',
      status: 'operational',
      timestamp: new Date().toISOString(),
      endpoints: {
        auth: '/auth',
        user: '/user',
        content: '/content',
        thread: '/thread',
      },
    };
  }
}
