import { Injectable, Inject } from '@nestjs/common';
import { PRODUCT_REPOSITORY_PORT } from '../domain/port/product.repository.port';
import type {
  ProductData,
  ProductRepositoryInterface,
} from '../domain/port/product.repository.port';
import { defaultPage, defaultLimit } from '../../../enums/pagination';

@Injectable()
export default class ProductService {
  constructor(
    @Inject(PRODUCT_REPOSITORY_PORT)
    private readonly productRepository: ProductRepositoryInterface,
  ) {}

  public async index(
    page: number = defaultPage,
    limit: number = defaultLimit,
    order_by: string,
    name?: string,
  ): Promise<ProductData[]> {
    const data: ProductData[] = await this.productRepository.index(
      page,
      limit,
      order_by,
      name,
    );
    return data;
  }
}
