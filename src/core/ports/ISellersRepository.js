/**
 * Port (Interface) para Sellers Repository
 * MEJORA: Hexagonal Architecture - Definir puertos claros
 */

export class ISellersRepository {
    /**
     * Obtener todos los vendedores
     * @returns {Promise<Array>}
     */
    async findAll() {
        throw new Error('Method not implemented: findAll');
    }

    /**
     * Obtener vendedor por ID
     * @param {string} id
     * @returns {Promise<Object|null>}
     */
    async findById(id) {
        throw new Error('Method not implemented: findById');
    }

    /**
     * Obtener vendedores activos
     * @returns {Promise<Array>}
     */
    async findActive() {
        throw new Error('Method not implemented: findActive');
    }

    /**
     * Obtener vendedor por especialidad
     * @param {string} specialty
     * @returns {Promise<Array>}
     */
    async findBySpecialty(specialty) {
        throw new Error('Method not implemented: findBySpecialty');
    }

    /**
     * Guardar vendedor
     * @param {Object} seller
     * @returns {Promise<Object>}
     */
    async save(seller) {
        throw new Error('Method not implemented: save');
    }

    /**
     * Actualizar vendedor
     * @param {string} id
     * @param {Object} data
     * @returns {Promise<Object>}
     */
    async update(id, data) {
        throw new Error('Method not implemented: update');
    }

    /**
     * Eliminar vendedor
     * @param {string} id
     * @returns {Promise<boolean>}
     */
    async delete(id) {
        throw new Error('Method not implemented: delete');
    }
}
