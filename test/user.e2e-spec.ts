import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { DATABASE } from '../src/database/database.module';
import { eq } from 'drizzle-orm';
import { users } from '../src/database/schema/users';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let db: any;
  let authCookie: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    db = moduleFixture.get(DATABASE);
    await app.init();

    const credentials = Buffer.from('admin@wms-api.com:rahasia123').toString(
      'base64',
    );

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .set('Authorization', `Basic ${credentials}`); // Send Basic Auth header

    const setCookie = loginResponse.headers['set-cookie'];
    if (!setCookie?.length) {
      throw new Error(
        `Login did not return an authentication cookie (status ${loginResponse.status})`,
      );
    }

    // Send only the cookie pair, without attributes such as HttpOnly or Max-Age.
    authCookie = setCookie[0].split(';', 1)[0];
  });

  it('Should register a new user', async () => {
    const role = await db.query.roles.findFirst({
      where: (roles: any, { eq }: any) => eq(roles.name, 'Root Admin'),
    });

    const emailTest: string = 'test@example.com';

    const response = await request(app.getHttpServer())
      .post('/users')
      .set('Cookie', authCookie) //  Send the captured cookie for authentication
      .send({
        role_id: role.id,
        email: emailTest,
        name: 'Test User',
        password: 'Password123!',
        is_active: true,
      });

    expect(response.status).toBe(201);

    await db.delete(users).where(eq(users.email, emailTest));
  });

  afterEach(async () => {
    await app.close();
  });
});
