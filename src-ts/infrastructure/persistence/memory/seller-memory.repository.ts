import { Injectable } from '@nestjs/common';
import { ISellerRepository } from '@domain/sellers/repositories/seller.repository.interface';
import { Seller } from '@domain/sellers/entities/seller.entity';
import { SellerId } from '@domain/sellers/value-objects/seller-id.vo';
import { Email } from '@domain/sellers/value-objects/email.vo';
import { SellerStatus } from '@domain/sellers/value-objects/seller-status.vo';

/**
 * Implementación en memoria del repositorio de vendedores
 * Útil para desarrollo y testing
 */
@Injectable()
export class SellerMemoryRepository implements ISellerRepository {
  private sellers: Map<string, Seller> = new Map();

  constructor() {
    this.seedInitialSellers();
  }

  async findById(id: SellerId): Promise<Seller | null> {
    return this.sellers.get(id.value) || null;
  }

  async findAll(): Promise<Seller[]> {
    return Array.from(this.sellers.values());
  }

  async findAvailable(): Promise<Seller[]> {
    return Array.from(this.sellers.values()).filter(s => s.canAcceptClient());
  }

  async findBySpecialty(specialty: string): Promise<Seller[]> {
    return Array.from(this.sellers.values()).filter(
      s => s.specialty === specialty,
    );
  }

  async save(seller: Seller): Promise<void> {
    this.sellers.set(seller.id.value, seller);
  }

  async delete(id: SellerId): Promise<void> {
    this.sellers.delete(id.value);
  }

  private seedInitialSellers(): void {
    // Seed de vendedores iniciales (los 5 originales)
    const initialSellers = [
      {
        name: 'Ana García',
        email: 'ana@emberdrago.com',
        phone: '+573001234567',
        specialty: 'premium',
        maxClients: 10,
      },
      {
        name: 'Carlos Méndez',
        email: 'carlos@emberdrago.com',
        phone: '+573009876543',
        specialty: 'general',
        maxClients: 10,
      },
      {
        name: 'María López',
        email: 'maria@emberdrago.com',
        phone: '+573005555555',
        specialty: 'technical',
        maxClients: 8,
      },
      {
        name: 'Juan Rodríguez',
        email: 'juan@emberdrago.com',
        phone: '+573007777777',
        specialty: 'general',
        maxClients: 10,
      },
      {
        name: 'Laura Martínez',
        email: 'laura@emberdrago.com',
        phone: '+573008888888',
        specialty: 'vip',
        maxClients: 5,
      },
    ];

    initialSellers.forEach(data => {
      const seller = Seller.create(data);
      this.sellers.set(seller.id.value, seller);
    });

    console.log(`✅ Seeded ${initialSellers.length} sellers`);
  }
}
