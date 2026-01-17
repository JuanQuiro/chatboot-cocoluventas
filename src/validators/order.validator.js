/**
 * Order Validators using Zod
 */

import { z } from 'zod';

const orderProductSchema = z.object({
    producto_id: z.number().int().positive().optional(),
    cantidad: z.number().int().positive(),
    precio_unitario: z.number().positive(),
    nombre: z.string().min(1),
    sku: z.string().optional()
});

export const createOrderSchema = z.object({
    cliente_id: z.number().int().positive().optional(),
    cliente_cedula: z.string().optional(),
    cliente_nombre: z.string().min(1, 'Nombre del cliente requerido'),
    cliente_apellido: z.string().min(1, 'Apellido del cliente requerido'),
    cliente_telefono: z.string().optional(),
    cliente_email: z.string().email().optional().or(z.literal('')),
    cliente_direccion: z.string().optional(),

    productos: z.array(orderProductSchema).min(1, 'Debe incluir al menos un producto'),

    subtotal_usd: z.number().min(0),
    monto_descuento_usd: z.number().min(0).optional().default(0),
    monto_iva_usd: z.number().min(0).optional().default(0),
    monto_delivery_usd: z.number().min(0).optional().default(0),
    total_usd: z.number().positive(),
    aplica_iva: z.boolean().optional().default(false),

    metodo_pago: z.string().optional().default('efectivo'),
    referencia_pago: z.string().optional(),

    es_abono: z.boolean().optional().default(false),
    monto_abono_usd: z.number().min(0).optional().default(0),

    tasa_bcv: z.number().positive().optional().default(36.50),
    estado_entrega: z.string().optional().default('pendiente'),
    comentarios_generales: z.string().optional(),
    vendedor_id: z.number().int().positive().optional()
});

export const updateOrderSchema = z.object({
    subtotal_usd: z.number().min(0).optional(),
    monto_descuento_usd: z.number().min(0).optional(),
    monto_iva_usd: z.number().min(0).optional(),
    monto_delivery_usd: z.number().min(0).optional(),
    total_usd: z.number().positive().optional(),
    aplica_iva: z.boolean().optional(),
    estado_entrega: z.string().optional(),
    comentarios_generales: z.string().optional()
});

export const orderIdSchema = z.object({
    id: z.coerce.number().int().positive()
});

export const cancelOrderSchema = z.object({
    motivo: z.string().max(500).optional()
});
