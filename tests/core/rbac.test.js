/**
 * Tests para RBAC
 */

import { 
    ROLES, 
    PERMISSIONS, 
    hasPermission, 
    isTechnicalRole,
    canViewAdvancedAudit 
} from '../../src/core/rbac/roles.js';

describe('RBAC', () => {
    describe('hasPermission', () => {
        test('USER debe tener permisos básicos', () => {
            expect(hasPermission(ROLES.USER, 'dashboard.view')).toBe(true);
            expect(hasPermission(ROLES.USER, 'orders.view')).toBe(true);
        });

        test('USER no debe tener permisos avanzados', () => {
            expect(hasPermission(ROLES.USER, 'sellers.create')).toBe(false);
            expect(hasPermission(ROLES.USER, 'system.debug')).toBe(false);
        });

        test('ADMIN debe tener todos los permisos', () => {
            const allPermissions = Object.keys(PERMISSIONS);
            allPermissions.forEach(permission => {
                expect(hasPermission(ROLES.ADMIN, permission)).toBe(true);
            });
        });

        test('TECHNICAL debe tener permisos técnicos', () => {
            expect(hasPermission(ROLES.TECHNICAL, 'system.debug')).toBe(true);
            expect(hasPermission(ROLES.TECHNICAL, 'system.logs')).toBe(true);
            expect(hasPermission(ROLES.TECHNICAL, 'database.query')).toBe(true);
        });

        test('AUDITOR debe tener permisos de auditoría', () => {
            expect(hasPermission(ROLES.AUDITOR, 'audit.view')).toBe(true);
            expect(hasPermission(ROLES.AUDITOR, 'audit.export')).toBe(true);
            expect(hasPermission(ROLES.AUDITOR, 'audit.advanced')).toBe(true);
        });

        test('MANAGER debe tener permisos de gestión', () => {
            expect(hasPermission(ROLES.MANAGER, 'orders.create')).toBe(true);
            expect(hasPermission(ROLES.MANAGER, 'orders.edit')).toBe(true);
            expect(hasPermission(ROLES.MANAGER, 'sellers.assign')).toBe(true);
        });

        test('MANAGER no debe tener permisos admin', () => {
            expect(hasPermission(ROLES.MANAGER, 'sellers.delete')).toBe(false);
            expect(hasPermission(ROLES.MANAGER, 'system.debug')).toBe(false);
        });
    });

    describe('isTechnicalRole', () => {
        test('debe identificar roles técnicos', () => {
            expect(isTechnicalRole(ROLES.ADMIN)).toBe(true);
            expect(isTechnicalRole(ROLES.TECHNICAL)).toBe(true);
        });

        test('debe identificar roles no técnicos', () => {
            expect(isTechnicalRole(ROLES.USER)).toBe(false);
            expect(isTechnicalRole(ROLES.MANAGER)).toBe(false);
            expect(isTechnicalRole(ROLES.AUDITOR)).toBe(false);
        });
    });

    describe('canViewAdvancedAudit', () => {
        test('AUDITOR y ADMIN deben ver auditoría avanzada', () => {
            expect(canViewAdvancedAudit(ROLES.AUDITOR)).toBe(true);
            expect(canViewAdvancedAudit(ROLES.ADMIN)).toBe(true);
        });

        test('otros roles no deben ver auditoría avanzada', () => {
            expect(canViewAdvancedAudit(ROLES.USER)).toBe(false);
            expect(canViewAdvancedAudit(ROLES.MANAGER)).toBe(false);
        });
    });
});
