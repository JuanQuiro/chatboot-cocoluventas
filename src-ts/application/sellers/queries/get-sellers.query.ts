/**
 * Query para obtener vendedores
 */
export class GetSellersQuery {
  constructor(public readonly onlyAvailable?: boolean) {}
}
