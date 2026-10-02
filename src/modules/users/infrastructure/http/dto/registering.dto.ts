import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisteringDto {
  @IsNotEmpty({ message: 'Role id is required' })
  @IsUUID()
  @MaxLength(255)
  role_id!: string;

  @IsEmail({}, { message: 'Valid email address required' })
  @IsNotEmpty({ message: 'Email address required' })
  @IsString()
  @MaxLength(255)
  // Safe Transform check (ensures string operations don't fail if non-string sent)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toLowerCase().trim() : value,
  )
  email!: string; // Definite assignment assertion (!)

  @IsNotEmpty({ message: 'Name required' })
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsNotEmpty({ message: 'Password required' })
  @IsString()
  @MaxLength(255)
  password!: string;

  @IsOptional()
  @IsBoolean({ message: 'is_active must be a boolean value if provided' })
  is_active?: boolean;
}
