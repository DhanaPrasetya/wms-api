import { UnauthorizedException } from '@nestjs/common';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginDto {
  static fromAuthorizationHeader(authorization: string | undefined): LoginDto {
    if (!authorization) {
      throw new UnauthorizedException('Authorization header required');
    }

    const parts: string[] = authorization.trim().split(/\s+/);
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'basic') {
      throw new UnauthorizedException('Basic authorization required');
    }

    const credentials: string = Buffer.from(parts[1], 'base64').toString(
      'utf8',
    );
    const separatorIndex: number = credentials.indexOf(':');
    if (separatorIndex <= 0) {
      throw new UnauthorizedException('Invalid authorization credentials');
    }

    const email: string = credentials
      .slice(0, separatorIndex)
      .trim()
      .toLowerCase();
    const password: string = credentials.slice(separatorIndex + 1);
    if (!password) {
      throw new UnauthorizedException('Invalid authorization credentials');
    }

    const dto: LoginDto = new LoginDto();
    dto.email = email;
    dto.password = password;
    return dto;
  }

  @IsEmail({}, { message: 'Valid email address required' })
  @IsNotEmpty({ message: 'Email address required' })
  @IsString()
  @MaxLength(255)
  // Safe Transform check (ensures string operations don't fail if non-string sent)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toLowerCase().trim() : value,
  )
  email!: string; // Definite assignment assertion (!)

  @IsNotEmpty({ message: 'Password required' })
  @IsString()
  @MaxLength(255)
  password!: string;
}
