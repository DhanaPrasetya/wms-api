import { Controller, Get } from '@nestjs/common';
import { HttpCode, HttpStatus } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

  @Get()
  @HttpCode(HttpStatus.OK)
  getHello(): string {
    return 'It works!';
  }
}
