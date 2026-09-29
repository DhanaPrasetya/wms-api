import { User } from '../model/user.model';

export const USER_REPOSITORY_PORT: unique symbol = Symbol(
  // token for dependency injection
  'USER_REPOSITORY_PORT',
);

export interface UserRepositoryInterface {
  findByEmail(email: string): Promise<User | null>;
}
