export const USER_REPOSITORY_PORT: unique symbol = Symbol(
  // token for dependency injection
  'USER_REPOSITORY_PORT',
);

export interface UserLoginData {
  id: string;
  role_id: string;
  email: string;
  name: string;
  password: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date | null;
  deleted_at: Date | null;
  role: {
    name: string;
  };
}

export interface RegisteringUser {
  role_id: string;
  email: string;
  name: string;
  password: string;
  is_active?: boolean | undefined;
}

export interface UserRepositoryInterface {
  findByEmail(email: string): Promise<UserLoginData | null>;
  registeringUser(userData: RegisteringUser): Promise<void>;
}
