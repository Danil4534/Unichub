import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @ApiOperation({ summary: 'Send Otp code to email' })
  @Post('/send-otp')
  async sendEmail(@Body() dto: any) {
    return this.emailService.sendToEmail(dto);
  }
}
