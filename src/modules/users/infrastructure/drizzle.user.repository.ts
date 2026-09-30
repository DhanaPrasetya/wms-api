import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE } from '../../../database/database.module';
import { users } from '../../../database/schema/index';
import * as schema from '../../../database/schema/index';

import {
  UserData,
  UserRepositoryInterface,
} from '../domain/port/user.repository.port';

type UserSelectModel = typeof users.$inferSelect;

@Injectable()
export class DrizzleUserRepository implements UserRepositoryInterface {
  constructor(
    @Inject(DATABASE)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async findByEmail(email: string): Promise<UserData | null> {
    const userData: (UserSelectModel & UserData) | undefined =
      await this.db.query.users.findFirst({
        where: eq(users.email, email),
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
