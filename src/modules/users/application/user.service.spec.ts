import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { jest } from '@jest/globals';
import { UserService } from './user.service';
import { USER_REPOSITORY_PORT } from '../domain/port/user.repository.port';

describe('UserService', () => {
  let userService: UserService;
  let userRepositoryMock: Record<string, jest.Mock<() => Promise<unknown>>>;

  beforeEach(async () => {
    // 1. Create mock repository functions
    userRepositoryMock = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
    };

    // 2. Compile a testing module with mocked providers
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: USER_REPOSITORY_PORT, // Token / Symbol used for DI
          useValue: userRepositoryMock, // Inject mock repository
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('findByEmail', () => {
    it('should return a user if found', async () => {
      const mockUser: object = { id: '1', email: 'test@example.com' };
      userRepositoryMock.findByEmail.mockResolvedValue(mockUser);

      const result: object = await userService.findByEmail('test@example.com');

      expect(userRepositoryMock.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user is not found', async () => {
      userRepositoryMock.findByEmail.mockResolvedValue(null);

      await expect(
        userService.findByEmail('notfound@example.com'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
