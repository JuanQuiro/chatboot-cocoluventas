import { Seller } from '@domain/sellers/entities/seller.entity';

/**
 * DTO para exponer datos del vendedor
 */
export class SellerDTO {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  currentClients: number;
  maxClients: number;
  specialty: string;
  rating: number;
  loadPercentage: number;
  createdAt: Date;
  updatedAt: Date;

  static fromDomain(seller: Seller): SellerDTO {
    const dto = new SellerDTO();
    dto.id = seller.id.value;
    dto.name = seller.name;
    dto.email = seller.email.value;
    dto.phone = seller.phone;
    dto.status = seller.status.value;
    dto.currentClients = seller.currentClients;
    dto.maxClients = seller.maxClients;
    dto.specialty = seller.specialty;
    dto.rating = seller.rating;
    dto.loadPercentage = seller.getLoadPercentage();
    dto.createdAt = seller.createdAt;
    dto.updatedAt = seller.updatedAt;
    return dto;
  }
}
