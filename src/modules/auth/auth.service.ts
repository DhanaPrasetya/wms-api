import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(private readonly authService: AuthService) {
    // By default, Passport looks for 'username' and 'password' body properties
    super({ usernameField: 'email' });
  }
}
