import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../users/application/user.service';
import type { UserData } from '../../users/domain/port/user.repository.port';

interface JwtPayload {
  id: string;
  name: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string) {
    const user: UserData | null = await this.userService.findByEmail(email);

    if (!user) {
      return 'Invalid email or password';
    }

    const payload: JwtPayload = {
      id: user.id,
      name: user.name,
      role: user.role.name,
    };

    const accessToken: string = this.jwtService.sign(payload);

    return accessToken;
  }
}
