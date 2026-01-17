import providerService from '../services/provider.service.js';

export const getAllProviders = async (req, res) => {
    try {
        const providers = providerService.getAllProviders();
        res.json({ success: true, data: providers });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getProviderById = async (req, res) => {
    try {
        const provider = providerService.getProviderById(req.params.id);
        if (!provider) {
            return res.status(404).json({ success: false, error: 'Proveedor no encontrado' });
        }
        res.json({ success: true, data: provider });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const createProvider = async (req, res) => {
    try {
        const provider = providerService.createProvider(req.body);
        res.status(201).json({ success: true, data: provider });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const updateProvider = async (req, res) => {
    try {
        const provider = providerService.updateProvider(req.params.id, req.body);
        if (!provider) {
            return res.status(404).json({ success: false, error: 'Proveedor no encontrado' });
        }
        res.json({ success: true, data: provider });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const deleteProvider = async (req, res) => {
    try {
        await providerService.deleteProvider(req.params.id);
        res.json({ success: true, message: 'Proveedor eliminado' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
