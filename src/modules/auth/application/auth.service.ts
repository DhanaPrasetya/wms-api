import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../users/application/user.service';
import type { UserLoginData } from '../../users/domain/port/user.repository.port';
import argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';

interface JwtPayload {
  id: string;
  name: string;
  role: string;
  jti: string; // Unique identifier for the JWT
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  private async verifyPassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await argon2.verify(hashedPassword, plainPassword);
  }

  async login(email: string, password: string): Promise<string> {
    const user: UserLoginData | null =
      await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid: boolean = await this.verifyPassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload: JwtPayload = {
      id: user.id,
      name: user.name,
      role: user.role.name,
      jti: uuidv4(),
    };

    const accessToken: string = this.jwtService.sign(payload);

    return accessToken;
  }
}
