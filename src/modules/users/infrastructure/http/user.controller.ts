import { Body, Controller, Post, Get } from '@nestjs/common';
import { UserService } from '../../application/user.service';
import { RegisteringDto } from './dto/registering.dto';
import { Auth } from '../../../../common/decorators/auth.decorators';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Auth('Root Admin') // jwt verif, role whitelist verif, and user throttling
  @Post()
  async registeringUser(@Body() registeringDto: RegisteringDto) {
    await this.userService.registeringUser(registeringDto);

    return { message: 'User registered successfully!' };
  }

  @Auth() // jwt verif, role whitelist verif, and user throttling
  @Get()
  async test() {
    return { message: 'Test endpoint accessed successfully!' };
  }
}
