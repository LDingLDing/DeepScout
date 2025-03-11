import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendVerificationCode(email: string, code: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: '【InfoRadar】登录验证码',
      template: 'verification-code',
      context: {
        code,
        expiresIn: '5分钟',
        year: new Date().getFullYear(),
      },
    });
  }
}
