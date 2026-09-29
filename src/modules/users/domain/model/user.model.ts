export class User {
  constructor(
    public readonly id: string,
    public readonly role_id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly password: string,
    public readonly is_active: boolean,
    public readonly created_at: Date,
    public readonly updated_at: Date | null,
    public readonly deleted_at: Date | null,
  ) {}
}
