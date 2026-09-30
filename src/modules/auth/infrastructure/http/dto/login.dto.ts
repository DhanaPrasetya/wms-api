import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
} from '@nestjs/class-validator';
import { Transform } from '@nestjs/class-transformer';

export class LoginDto {
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
