export class TestRollbackError extends Error {
  constructor() {
    super('INTENTIONAL_TEST_ROLLBACK');
    this.name = 'TestRollbackError';
  }
}
