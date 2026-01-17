import sellerPaymentRepository from '../repositories/seller-payment.repository.js';

class SellerPaymentService {
    createPayment(data) {
        // Basic validation
        if (!data.seller_id || !data.amount) {
            throw new Error('Seller ID and Amount are required');
        }

        const payment = {
            seller_id: data.seller_id,
            amount: parseFloat(data.amount),
            date: data.date || new Date().toISOString(),
            notes: data.notes || ''
        };

        return sellerPaymentRepository.create(payment);
    }

    getPaymentsBySeller(sellerId) {
        return sellerPaymentRepository.getBySellerId(sellerId);
    }

    getTotalPaid(sellerId) {
        return sellerPaymentRepository.getTotalPaidBySeller(sellerId);
    }
}

export default new SellerPaymentService();
