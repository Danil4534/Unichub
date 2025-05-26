import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';

describe('AppModule', () => {
  let appModule: TestingModule;

  beforeAll(async () => {
    appModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  it('should compile the module successfully', () => {
    expect(appModule).toBeDefined();
  });

  it('should have PrismaService provider', () => {
    const prismaService = appModule.get('PrismaService');
    expect(prismaService).toBeDefined();
  });
});
