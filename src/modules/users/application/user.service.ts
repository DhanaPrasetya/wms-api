import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { USER_REPOSITORY_PORT } from '../domain/port/user.repository.port';
import type {
  UserLoginData,
  RegisteringUser,
  UserRepositoryInterface,
} from '../domain/port/user.repository.port';
import argon2 from 'argon2';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY_PORT)
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async findByEmail(email: string) {
    const user: UserLoginData | null =
      await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async registeringUser(userData: RegisteringUser) {
    await argon2.hash(userData.password).then((hashedPassword) => {
      userData.password = hashedPassword;
    });

    await this.userRepository.registeringUser(userData);
  }
}
