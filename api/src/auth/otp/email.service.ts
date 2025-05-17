import { Injectable, BadRequestException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { OtpEmail } from './otpEmail';
import { renderAsync } from '@react-email/render';
@Injectable()
export class EmailService {
  private readonly transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendToEmail(dto) {
    const emailHtml = await renderAsync(
      OtpEmail({ username: dto.username, code: dto.code }),
    );
    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL,
      to: dto.toEmail,
      subject: 'Your OTP Code',
      html: emailHtml,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);

      if (info.accepted.length > 0) {
        return true;
      }
      throw new BadRequestException(
        'Something went wrong when sending OTP email',
      );
    } catch (e) {
      throw new BadRequestException('Failed to send Email', e);
    }
  }
}
