/**
 * Client Validators using Zod
 */

import { z } from 'zod';

// Venezuelan cedula validation (7-8 digits)
const cedulaSchema = z.string()
    .min(7, 'La cédula debe tener al menos 7 dígitos')
    .max(8, 'La cédula debe tener máximo 8 dígitos')
    .regex(/^\d+$/, 'La cédula solo debe contener números');

// Phone validation (Venezuelan format - more flexible)
const phoneSchema = z.string()
    .regex(/^(04\d{9,10}|0\d{10})$/, 'Formato de teléfono inválido (debe comenzar con 0 y tener 10-11 dígitos)')
    .optional()
    .or(z.literal(''));

export const createClientSchema = z.object({
    cedula: cedulaSchema,
    nombre: z.string()
        .min(1, 'El nombre es requerido')
        .max(100, 'El nombre es demasiado largo'),
    apellido: z.string()
        .min(1, 'El apellido es requerido')
        .max(100, 'El apellido es demasiado largo'),
    telefono: phoneSchema,
    email: z.string()
        .email('Email inválido')
        .optional()
        .or(z.literal('')),
    direccion: z.string()
        .max(500, 'La dirección es demasiado larga')
        .optional()
        .or(z.literal(''))
});

export const updateClientSchema = createClientSchema.partial();

export const clientIdSchema = z.object({
    id: z.coerce.number().int().positive()
});
