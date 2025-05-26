// email.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';

describe('EmailController', () => {
  let controller: EmailController;
  let emailService: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailController],
      providers: [
        {
          provide: EmailService,
          useValue: {
            sendToEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<EmailController>(EmailController);
    emailService = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call emailService.sendToEmail with dto and return result', async () => {
    const dto = { email: 'test@example.com' };
    const expectedResult = true;

    jest.spyOn(emailService, 'sendToEmail').mockResolvedValue(expectedResult);

    const result = await controller.sendEmail(dto);

    expect(emailService.sendToEmail).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expectedResult);
  });
});
