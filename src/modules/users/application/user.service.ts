// modules/users/application/use-cases/get-user-by-email.use-case.ts
import { Injectable, Inject } from '@nestjs/common';
import type { UserRepositoryInterface } from '../domain/port/user.repository.port';
import { User } from '../domain/model/user.model';
import { USER_REPOSITORY_PORT } from '../domain/port/user.repository.port';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY_PORT)
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async execute(email: string) {
    const user: User | null = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}
