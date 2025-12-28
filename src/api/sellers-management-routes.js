import sellerRepository from '../repositories/seller.repository.js';

export const setupSellersManagementRoutes = (app) => {
  console.log('✅ Sellers Management API Routes loaded');

  /**
   * GET /api/sellers
   * Return all sellers
   */
  app.get('/api/sellers', (req, res) => {
    try {
      const sellers = sellerRepository.findAll();
      res.json(sellers);
    } catch (error) {
      console.error('Error fetching sellers:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/sellers
   * Create a new seller
   */
  app.post('/api/sellers', (req, res) => {
    try {
      const newSeller = sellerRepository.create(req.body);
      res.status(201).json(newSeller);
    } catch (error) {
      console.error('Error creating seller:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * PUT /api/sellers/:id
   * Update an existing seller
   */
  app.put('/api/sellers/:id', (req, res) => {
    try {
      const updatedSeller = sellerRepository.update(req.params.id, req.body);
      if (!updatedSeller) {
        return res.status(404).json({ error: 'Seller not found' });
      }
      res.json(updatedSeller);
    } catch (error) {
      console.error('Error updating seller:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * DELETE /api/sellers/:id
   * Delete a seller
   */
  app.delete('/api/sellers/:id', (req, res) => {
    try {
      const success = sellerRepository.delete(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Seller not found' });
      }
      res.json({ success: true, message: 'Seller deleted successfully' });
    } catch (error) {
      console.error('Error deleting seller:', error);
      res.status(500).json({ error: error.message });
    }
  });
};

export default setupSellersManagementRoutes;
