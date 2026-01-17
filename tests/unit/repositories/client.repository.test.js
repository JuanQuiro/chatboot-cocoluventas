/**
 * Unit tests for ClientRepository
 */

import { describe, it, expect, beforeEach } from 'vitest';
import clientRepository from '../../../src/repositories/client.repository.js';

describe('ClientRepository', () => {
    beforeEach(() => {
        // Database is reset in setup.js
    });

    describe('create', () => {
        it('should create a new client', () => {
            const clientData = {
                cedula: '12345678',
                nombre: 'Juan',
                apellido: 'Pérez',
                telefono: '04241234567',
                email: 'juan@test.com',
                direccion: 'Caracas'
            };

            const client = clientRepository.create(clientData);

            expect(client).toBeDefined();
            expect(client.id).toBeDefined();
            expect(client.cedula).toBe('12345678');
            expect(client.nombre).toBe('Juan');
            expect(client.apellido).toBe('Pérez');
        });

        it('should throw error for duplicate cedula', () => {
            const clientData = {
                cedula: '12345678',
                nombre: 'Juan',
                apellido: 'Pérez'
            };

            clientRepository.create(clientData);

            expect(() => {
                clientRepository.create(clientData);
            }).toThrow();
        });
    });

    describe('getById', () => {
        it('should return client by id', () => {
            const created = clientRepository.create({
                cedula: '12345678',
                nombre: 'Juan',
                apellido: 'Pérez'
            });

            const client = clientRepository.getById(created.id);

            expect(client).toBeDefined();
            expect(client.id).toBe(created.id);
            expect(client.nombre).toBe('Juan');
        });

        it('should return undefined for non-existent id', () => {
            const client = clientRepository.getById(999);
            expect(client).toBeUndefined();
        });
    });

    describe('getByCedula', () => {
        it('should return client by cedula', () => {
            clientRepository.create({
                cedula: '12345678',
                nombre: 'Juan',
                apellido: 'Pérez'
            });

            const client = clientRepository.getByCedula('12345678');

            expect(client).toBeDefined();
            expect(client.cedula).toBe('12345678');
        });
    });

    describe('search', () => {
        beforeEach(() => {
            clientRepository.create({
                cedula: '12345678',
                nombre: 'Juan',
                apellido: 'Pérez',
                telefono: '04241234567'
            });
            clientRepository.create({
                cedula: '87654321',
                nombre: 'María',
                apellido: 'González',
                telefono: '04149876543'
            });
        });

        it('should search by name', () => {
            const results = clientRepository.search('Juan');
            expect(results).toHaveLength(1);
            expect(results[0].nombre).toBe('Juan');
        });

        it('should search by cedula', () => {
            const results = clientRepository.search('876');
            expect(results).toHaveLength(1);
            expect(results[0].cedula).toBe('87654321');
        });

        it('should return empty array for no matches', () => {
            const results = clientRepository.search('NoExiste');
            expect(results).toHaveLength(0);
        });
    });

    describe('update', () => {
        it('should update client', () => {
            const created = clientRepository.create({
                cedula: '12345678',
                nombre: 'Juan',
                apellido: 'Pérez'
            });

            const updated = clientRepository.update(created.id, {
                nombre: 'Juan Carlos',
                apellido: 'Pérez',
                telefono: '04241234567'
            });

            expect(updated.nombre).toBe('Juan Carlos');
            expect(updated.telefono).toBe('04241234567');
        });
    });

    describe('delete', () => {
        it('should soft delete client', () => {
            const created = clientRepository.create({
                cedula: '12345678',
                nombre: 'Juan',
                apellido: 'Pérez'
            });

            clientRepository.delete(created.id);

            const all = clientRepository.getAll();
            expect(all).toHaveLength(0);
        });
    });
});
