import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return the Talkotopia API status payload', () => {
      const status = appController.getSystemStatus();

      expect(status.status).toBe('up');
      expect(status.platform).toBe('Talkotopia LMS');
      expect(status.message).toContain('تالکوتوپیا');
      expect(status.timestamp).toBeDefined();
    });
  });
});
