import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Injectable, Inject } from '@nestjs/common';
import { AssignSellerCommand } from '../commands/assign-seller.command';
import { ISellerRepository } from '@domain/sellers/repositories/seller.repository.interface';
import { SellerDTO } from '../dto/seller.dto';
import { NoAvailableSellersException } from '@domain/sellers/exceptions/seller.exceptions';

@Injectable()
@CommandHandler(AssignSellerCommand)
export class AssignSellerHandler implements ICommandHandler<AssignSellerCommand> {
  constructor(
    @Inject('ISellerRepository')
    private readonly sellerRepository: ISellerRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: AssignSellerCommand): Promise<SellerDTO> {
    // 1. Obtener vendedores disponibles
    let sellers = await this.sellerRepository.findAvailable();

    // 2. Filtrar por especialidad si se especifica
    if (command.specialty) {
      const specialistSellers = sellers.filter(
        s => s.specialty === command.specialty,
      );
      if (specialistSellers.length > 0) {
        sellers = specialistSellers;
      }
    }

    if (sellers.length === 0) {
      throw new NoAvailableSellersException();
    }

    // 3. Aplicar estrategia Round-Robin (simple)
    // Ordenar por carga actual y tomar el primero
    sellers.sort((a, b) => a.currentClients - b.currentClients);
    const seller = sellers[0];

    // 4. Asignar cliente al vendedor
    seller.assignClient(command.userId);

    // 5. Persistir cambios
    await this.sellerRepository.save(seller);

    // 6. Publicar eventos de dominio
    for (const event of seller.domainEvents) {
      this.eventBus.publish(event);
    }
    seller.clearEvents();

    // 7. Retornar DTO
    return SellerDTO.fromDomain(seller);
  }
}
