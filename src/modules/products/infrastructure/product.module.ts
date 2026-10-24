import { Module } from '@nestjs/common';
import { PRODUCT_REPOSITORY_PORT } from '../domain/port/product.repository.port';
import DrizzleProductRepository from './drizzle.product.repository';
import ProductService from '../application/product.service';
import ProductController from './http/product.controller';

@Module({
  providers: [
    ProductService,
    {
      provide: PRODUCT_REPOSITORY_PORT, // Token
      useClass: DrizzleProductRepository, // Concrete Drizzle implementation
    },
  ],
  controllers: [ProductController],
  exports: [ProductService],
})
export class ProductModule {}
