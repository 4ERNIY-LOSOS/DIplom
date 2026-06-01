import { Injectable } from '@nestjs/common';

@Injectable()
export class PasswordResetService {
  // Хранит код и userId: { [code: string]: { userId: number; expires: number } }
  private codes = new Map<string, { userId: number; expires: number }>();
  private captchaData = new Map<string, { answer: number; expires: number }>();

  generateCode(userId: number): string {
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 цифр
    const expires = Date.now() + 10 * 60 * 1000; // 10 минут
    this.codes.set(code, { userId, expires });
    return code;
  }

  generateCaptcha(): { question: string, id: string } {
    const a = Math.floor(Math.random() * 10);
    const b = Math.floor(Math.random() * 10);
    const id = Math.random().toString(36).substring(7); // ID капчи
    const expires = Date.now() + 5 * 60 * 1000; // 5 минут
    this.captchaData.set(id, { answer: a + b, expires });
    return { question: `${a} + ${b}`, id };
  }

  verifyCaptcha(id: string, answer: number): boolean {
    const data = this.captchaData.get(id);
    if (!data) return false;
    if (Date.now() > data.expires) {
      this.captchaData.delete(id);
      return false;
    }
    this.captchaData.delete(id);
    return data.answer === answer;
  }

  verifyCode(code: string): number | null {
    const data = this.codes.get(code);
    if (!data) return null;

    if (Date.now() > data.expires) {
      this.codes.delete(code);
      return null;
    }

    return data.userId;
  }

  deleteCode(code: string) {
    this.codes.delete(code);
  }
}
