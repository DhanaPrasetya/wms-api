import type { DynamicModule } from '@nestjs/common';

export function Throttle(_options: unknown): MethodDecorator & ClassDecorator {
  return () => undefined;
}

export function SkipThrottle(
  _options?: unknown,
): MethodDecorator & ClassDecorator {
  return () => undefined;
}

export class ThrottlerGuard {
  canActivate(): boolean {
    return true;
  }
}

export class ThrottlerModule {
  static forRoot(_options: unknown): DynamicModule {
    return { module: ThrottlerModule };
  }
}
