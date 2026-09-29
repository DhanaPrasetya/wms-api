import { Injectable, Inject } from '@nestjs/common';
import { eq, InferSelectModel } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE } from '../../../database/database.module';
import { users } from '../../../database/schema/index';
import * as schema from '../../../database/schema/index';

import { UserRepositoryInterface } from '../domain/port/user.repository.port';
import { User } from '../domain/model/user.model';

type UserSelectModel = InferSelectModel<typeof users>;

@Injectable()
export class DrizzleUserRepository implements UserRepositoryInterface {
  constructor(
    @Inject(DATABASE)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    const record: UserSelectModel | undefined =
      await this.db.query.users.findFirst({
        where: eq(users.email, email),
      });

    if (!record) return null;

    return new User(
      record.id,
      record.role_id,
      record.email,
      record.name,
      record.password,
      record.is_active,
      record.created_at,
      record.updated_at,
      record.deleted_at,
    );
  }
}
