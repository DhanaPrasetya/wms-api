import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { jest } from '@jest/globals';
import { UserService } from './user.service';
import { USER_REPOSITORY_PORT } from '../domain/port/user.repository.port';
import { RegisteringUser } from '../domain/port/user.repository.port';
import { ConflictException } from '@nestjs/common';

describe('UserService', () => {
  let userService: UserService;
  let userRepositoryMock: Record<string, jest.Mock<() => Promise<unknown>>>;

  beforeEach(async () => {
    // create mock repository functions
    userRepositoryMock = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      registeringUser: jest.fn(),
      save: jest.fn(),
    };

    // compile a testing module with mocked providers
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

  describe('registeringUser', () => {
    it('should register a new user and return nothing (void)', async () => {
      const mockUser: RegisteringUser = {
        role_id: '1',
        email: 'test@example.com',
        name: 'Test User',
        password: 'password',
        is_active: true,
      };

      userRepositoryMock.registeringUser.mockResolvedValue(undefined);

      const result: void = await userService.registeringUser(mockUser);

      expect(userRepositoryMock.registeringUser).toHaveBeenCalledWith(mockUser);
      expect(result).toBeUndefined();
    });

    it('should throw duplicate email error', async () => {
      const mockUser: RegisteringUser = {
        role_id: '1',
        email: 'duplicate@example.com',
        name: 'Test User',
        password: 'password',
        is_active: true,
      };

      // mock UserRepository to throw ConflictException (reflecting real repo behavior)
      userRepositoryMock.registeringUser.mockRejectedValue(
        new ConflictException('User with this email already exists !'),
      );

      // assert service allows ConflictException to propagate up
      await expect(userService.registeringUser(mockUser)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw foreign key constraint error', async () => {
      const mockUser: RegisteringUser = {
        role_id: '1',
        email: 'foreignkey@example.com',
        name: 'Test User',
        password: 'password',
        is_active: true,
      };

      userRepositoryMock.registeringUser.mockRejectedValue(
        new ConflictException('Role ID does not exist !'),
      );

      await expect(userService.registeringUser(mockUser)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
