import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'Old password required' })
  @IsString()
  @MaxLength(255)
  old_password!: string;

  @IsNotEmpty({ message: 'New password required' })
  @IsString()
  @MaxLength(255)
  new_password!: string;
}
