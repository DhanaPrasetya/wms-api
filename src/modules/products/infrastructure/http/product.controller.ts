import { Controller, Get, Query } from '@nestjs/common';
import ProductService from '../../application/product.service';
import { Auth } from '../../../../common/decorators/auth.decorators';
import { StandardResponse } from '../../../../common/decorators/standard-response.decorators';
import { IndexDto } from './dto/index.dto';

@Controller('products')
export default class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Auth('Manager', 'Operational', 'Sales')
  @StandardResponse()
  @Get()
  async getProducts(@Query() query: IndexDto) {
    const products: object[] | undefined = await this.productService.index(
      query.page,
      query.limit,
      query.order_by,
      query.name,
    );
    return products;
  }
}
