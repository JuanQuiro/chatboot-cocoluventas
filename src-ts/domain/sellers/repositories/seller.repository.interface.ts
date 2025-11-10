import { Seller } from '../entities/seller.entity';
import { SellerId } from '../value-objects/seller-id.vo';

/**
 * Interface del repositorio (puerto en arquitectura hexagonal)
 * Las implementaciones van en la capa de infrastructure
 */
export interface ISellerRepository {
  findById(id: SellerId): Promise<Seller | null>;
  findAll(): Promise<Seller[]>;
  findAvailable(): Promise<Seller[]>;
  findBySpecialty(specialty: string): Promise<Seller[]>;
  save(seller: Seller): Promise<void>;
  delete(id: SellerId): Promise<void>;
}
