/**
 * Command Handler: Assign Seller
 * MEJORA: Handler con logging, events y error handling
 */

import { SellerAssignedEvent } from '../../../domain/events/DomainEvent.js';
import logger from '../../../../utils/logger.js';
import errorHandler from '../../../../utils/error-handler.js';

export class AssignSellerHandler {
    constructor(sellersRepository, assignmentService, eventBus) {
        this.sellersRepository = sellersRepository;
        this.assignmentService = assignmentService;
        this.eventBus = eventBus;
    }

    async handle(command) {
        return errorHandler.tryAsync(async () => {
            logger.info('Handling AssignSellerCommand', {
                userId: command.userId,
                specialty: command.specialty,
                correlationId: command.metadata.correlationId
            });

            // 1. Obtener vendedores disponibles
            const sellers = await this.sellersRepository.findActive();

            if (sellers.length === 0) {
                throw new Error('No sellers available');
            }

            // 2. Usar domain service para asignar
            const seller = this.assignmentService.assignSeller(sellers, {
                specialty: command.specialty,
                userId: command.userId
            });

            // 3. Actualizar vendedor
            seller.currentClients++;
            seller.assignedAt = new Date().toISOString();
            await this.sellersRepository.update(seller.id, seller);

            // 4. Publicar evento de dominio
            const event = new SellerAssignedEvent(
                command.userId,
                seller.id,
                seller.name,
                {
                    correlationId: command.metadata.correlationId,
                    causationId: command.metadata.correlationId,
                    userId: command.userId
                }
            );

            await this.eventBus.publish('seller.assigned', event);

            logger.info('Seller assigned successfully', {
                userId: command.userId,
                sellerId: seller.id,
                sellerName: seller.name
            });

            return {
                success: true,
                seller: {
                    id: seller.id,
                    name: seller.name,
                    phone: seller.phone,
                    specialty: seller.specialty
                }
            };
        }, {
            operation: 'AssignSeller',
            userId: command.userId
        });
    }
}
