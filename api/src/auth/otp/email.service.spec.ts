import { EmailService } from './email.service';
import { BadRequestException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { renderAsync } from '@react-email/render';

jest.mock('nodemailer');
jest.mock('@react-email/render', () => ({
  renderAsync: jest.fn(),
}));

describe('EmailService', () => {
  let service: EmailService;
  let sendMailMock: jest.Mock;

  beforeEach(() => {
    sendMailMock = jest.fn();

    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: sendMailMock,
    });
    process.env.SMTP_USER = 'user@example.com';
    process.env.SMTP_PASS = 'password';
    process.env.SMTP_FROM_EMAIL = 'no-reply@example.com';

    service = new EmailService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should send email successfully', async () => {
    const dto = {
      username: 'john_doe',
      code: '123456',
      toEmail: 'john@example.com',
    };

    (renderAsync as jest.Mock).mockResolvedValue('<html>Email Content</html>');

    sendMailMock.mockResolvedValue({ accepted: ['john@example.com'] });

    const result = await service.sendToEmail(dto);

    expect(renderAsync).toHaveBeenCalledWith({
      username: 'john_doe',
      code: '123456',
    });

    expect(sendMailMock).toHaveBeenCalledWith({
      from: 'no-reply@example.com',
      to: 'john@example.com',
      subject: 'Your OTP Code',
      html: '<html>Email Content</html>',
    });

    expect(result).toBe(true);
  });

  it('should throw BadRequestException if email not accepted', async () => {
    const dto = {
      username: 'john_doe',
      code: '123456',
      toEmail: 'john@example.com',
    };

    (renderAsync as jest.Mock).mockResolvedValue('<html>Email Content</html>');

    sendMailMock.mockResolvedValue({ accepted: [] });

    await expect(service.sendToEmail(dto)).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException on sendMail error', async () => {
    const dto = {
      username: 'john_doe',
      code: '123456',
      toEmail: 'john@example.com',
    };

    (renderAsync as jest.Mock).mockResolvedValue('<html>Email Content</html>');

    sendMailMock.mockRejectedValue(new Error('SMTP failure'));

    await expect(service.sendToEmail(dto)).rejects.toThrow(BadRequestException);
  });
});
