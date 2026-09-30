import { Injectable, Inject } from '@nestjs/common';
import { eq, isNull, and } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE } from '../../../database/database.module';
import { users } from '../../../database/schema/index';
import * as schema from '../../../database/schema/index';

import {
  UserLoginData,
  UserRepositoryInterface,
} from '../domain/port/user.repository.port';

type UserSelectModel = typeof users.$inferSelect;

@Injectable()
export class DrizzleUserRepository implements UserRepositoryInterface {
  constructor(
    @Inject(DATABASE)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async findByEmail(email: string): Promise<UserLoginData | null> {
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
  }
}
