import { Injectable, Inject } from '@nestjs/common';
import { USER_REPOSITORY_PORT } from '../domain/port/user.repository.port';
import type {
  UserData,
  UserRepositoryInterface,
} from '../domain/port/user.repository.port';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY_PORT)
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async findByEmail(email: string) {
    const user: UserData | null = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}
