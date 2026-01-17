import providerRepository from '../repositories/provider.repository.js';

class ProviderService {
    getAllProviders() {
        return providerRepository.getAll();
    }

    getProviderById(id) {
        return providerRepository.getById(id);
    }

    createProvider(data) {
        // Here we could add business validation if needed
        return providerRepository.create(data);
    }

    updateProvider(id, data) {
        return providerRepository.update(id, data);
    }

    deleteProvider(id) {
        return providerRepository.delete(id);
    }
}

export default new ProviderService();
