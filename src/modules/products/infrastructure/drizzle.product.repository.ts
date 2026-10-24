import { Injectable, Inject } from '@nestjs/common';
import { and, isNull, asc, desc, ilike, SQL } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE } from '../../../database/database.module';
import * as schema from '../../../database/schema/index';

import {
  ProductData,
  ProductRepositoryInterface,
} from '../domain/port/product.repository.port';

const escapeLikePattern = (value: string): string =>
  value.replace(/[\\%_]/g, '\\$&');

@Injectable()
export default class DrizzleProductRepository implements ProductRepositoryInterface {
  constructor(
    @Inject(DATABASE)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  public async index(
    page: number,
    limit: number,
    order_by: 'asc' | 'desc' | string = 'asc',
    name?: string,
  ): Promise<ProductData[]> {
    const offset: number = (page - 1) * limit;
    const searchTerm: string | undefined = name?.trim().toLocaleLowerCase();
    const escapedSearchTerm: string | undefined = searchTerm
      ? escapeLikePattern(searchTerm)
      : undefined;

    // Determine sorting direction dynamically
    const sortOrder: SQL =
      order_by.toLowerCase() === 'desc'
        ? desc(schema.products.created_at)
        : asc(schema.products.created_at);

    return this.db.query.products.findMany({
      // Combine soft delete check and optional name filter
      where: and(
        isNull(schema.products.deleted_at),
        escapedSearchTerm
          ? ilike(schema.products.name, `%${escapedSearchTerm}%`)
          : undefined,
      ),
      orderBy: [sortOrder],
      limit,
      offset,
    });
  }
}
