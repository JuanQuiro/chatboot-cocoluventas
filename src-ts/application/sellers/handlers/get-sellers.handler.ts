import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable, Inject } from '@nestjs/common';
import { GetSellersQuery } from '../queries/get-sellers.query';
import { ISellerRepository } from '@domain/sellers/repositories/seller.repository.interface';
import { SellerDTO } from '../dto/seller.dto';

@Injectable()
@QueryHandler(GetSellersQuery)
export class GetSellersHandler implements IQueryHandler<GetSellersQuery> {
  constructor(
    @Inject('ISellerRepository')
    private readonly sellerRepository: ISellerRepository,
  ) {}

  async execute(query: GetSellersQuery): Promise<SellerDTO[]> {
    const sellers = query.onlyAvailable
      ? await this.sellerRepository.findAvailable()
      : await this.sellerRepository.findAll();

    return sellers.map(seller => SellerDTO.fromDomain(seller));
  }
}
