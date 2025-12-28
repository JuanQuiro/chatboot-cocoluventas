/**
 * Product Validators using Zod
 */

import { z } from 'zod';

export const createProductSchema = z.object({
    sku: z.string()
        .max(50, 'SKU demasiado largo')
        .optional()
        .or(z.literal('')),
    nombre: z.string()
        .min(1, 'El nombre es requerido')
        .max(200, 'El nombre es demasiado largo'),
    descripcion: z.string()
        .max(1000, 'La descripción es demasiado larga')
        .optional()
        .or(z.literal('')),
    precio_usd: z.number()
        .positive('El precio debe ser positivo')
        .or(z.string().transform(val => parseFloat(val))),
    stock_actual: z.number()
        .int('El stock debe ser un número entero')
        .min(0, 'El stock no puede ser negativo')
        .optional()
        .default(0),
    stock_minimo: z.number()
        .int()
        .min(0)
        .optional()
        .default(0),
    stock_maximo: z.number()
        .int()
        .min(0)
        .optional()
        .default(1000),
    categoria_id: z.number()
        .int()
        .positive()
        .or(z.null())
        .or(z.string().transform(val => parseInt(val)))
        .optional()
        .transform(val => val || 1)
});

export const updateProductSchema = createProductSchema.partial();

export const productIdSchema = z.object({
    id: z.coerce.number().int().positive()
});

export const stockAdjustmentSchema = z.object({
    producto_id: z.number().int().positive(),
    cantidad: z.number().int(),
    comentario: z.string().max(500).optional()
});
