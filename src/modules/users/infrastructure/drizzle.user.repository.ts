import { Injectable, Inject } from '@nestjs/common';
import { eq, isNull, and } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE } from '../../../database/database.module';
import { users } from '../../../database/schema/index';
import * as schema from '../../../database/schema/index';
import { ConflictException } from '@nestjs/common';

import {
  UserLoginData,
  UserRepositoryInterface,
  RegisteringUser,
} from '../domain/port/user.repository.port';
import { isDatabaseError } from '../../../common/helper/db-error.utils';

type UserSelectModel = typeof users.$inferSelect;

@Injectable()
export class DrizzleUserRepository implements UserRepositoryInterface {
  constructor(
    @Inject(DATABASE)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async findByEmail(email: string): Promise<UserLoginData | null> {
    try {
      // excluding soft-deleted users
      const userData: (UserSelectModel & UserLoginData) | undefined =
        await this.db.query.users.findFirst({
          where: and(eq(users.email, email), isNull(users.deleted_at)),
          with: {
            role: {
              columns: {
                name: true,
              },
            },
          },
        });

      if (!userData) return null;

      return userData;
    } catch (error: unknown) {
      throw error;
    }
  }

  async registeringUser(userData: RegisteringUser) {
    try {
      await this.db.insert(users).values(userData);
    } catch (error: unknown) {
      if (isDatabaseError(error)) {
        const errorCode: string | undefined = error.code || error.cause?.code;

        if (errorCode === '23505') {
          throw new ConflictException('User with this email already exists!');
        }

        if (errorCode === '23503') {
          throw new ConflictException('Role ID does not exist!');
        }
      }

      throw error;
    }
  }
}
