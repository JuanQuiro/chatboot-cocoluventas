/**
 * Command para asignar vendedor
 */
export class AssignSellerCommand {
  constructor(
    public readonly userId: string,
    public readonly specialty?: string,
  ) {}
}
