export const PRODUCT_REPOSITORY_PORT: unique symbol = Symbol(
  // token for dependency injection
  'PRODUCT_REPOSITORY_PORT',
);

export interface ProductData {
  id: string;
  name: string;
  ean_code: string;
  description: string | null;
  photo: string | null;
  created_at: Date;
  updated_at: Date | null;
  deleted_at: Date | null;
}

export interface ProductRepositoryInterface {
  index(
    page: number,
    limit: number,
    order_by: string,
    name?: string,
  ): Promise<ProductData[]>;
}
