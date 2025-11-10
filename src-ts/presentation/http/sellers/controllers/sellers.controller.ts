import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AssignSellerCommand } from '@application/sellers/commands/assign-seller.command';
import { GetSellersQuery } from '@application/sellers/queries/get-sellers.query';
import { SellerDTO } from '@application/sellers/dto/seller.dto';

@Controller('sellers')
export class SellersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async getSellers(
    @Query('available') available?: boolean,
  ): Promise<SellerDTO[]> {
    return this.queryBus.execute(new GetSellersQuery(available));
  }

  @Post('assign')
  async assignSeller(
    @Body() body: { userId: string; specialty?: string },
  ): Promise<SellerDTO> {
    return this.commandBus.execute(
      new AssignSellerCommand(body.userId, body.specialty),
    );
  }
}
