import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getSystemStatus() {
    return {
      status: 'up',
      platform: 'Talkotopia LMS',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      message: 'به API پلتفرم آموزشی تالکوتوپیا خوش آمدید.',
    };
  }
}