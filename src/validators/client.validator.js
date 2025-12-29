/**
 * Client Validators using Zod
 */

import { z } from 'zod';

// Venezuelan cedula validation (flexible)
const cedulaSchema = z.string()
    .min(1, 'La cédula es requerida')
    .max(15, 'La cédula es demasiado larga')
    .regex(/^\d+$/, 'La cédula solo debe contener números');

// Phone validation (flexible - accepts any phone starting with 0)
const phoneSchema = z.string()
    .regex(/^0\d{7,15}$/, 'Formato de teléfono inválido (debe comenzar con 0 y tener 8-16 dígitos)')
    .optional()
    .or(z.literal(''))
    .or(z.null())
    .or(z.undefined());

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
        .or(z.literal(''))
        .or(z.null())
        .or(z.undefined())
        .optional(),
    direccion: z.string()
        .max(500, 'La dirección es demasiado larga')
        .optional()
        .or(z.literal(''))
});

export const updateClientSchema = createClientSchema.partial();

export const clientIdSchema = z.object({
    id: z.coerce.number().int().positive()
});
