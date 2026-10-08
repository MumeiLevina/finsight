import { z } from 'zod';
export const authSchema = z.object({ name: z.string().trim().min(2).max(80).optional(), email: z.email(), password: z.string().min(8).max(72) });
export const categorySchema = z.object({ name: z.string().trim().min(1).max(40), type: z.enum(['INCOME','EXPENSE']), color: z.string().regex(/^#[0-9A-F]{6}$/i).default('#64748B') });
export const transactionSchema = z.object({ type: z.enum(['INCOME','EXPENSE']), amount: z.coerce.bigint().positive(), categoryId: z.string().min(1), date: z.coerce.date(), note: z.string().trim().max(250).optional().nullable() });
export const budgetSchema = z.object({ month: z.string().regex(/^\d{4}-\d{2}$/), limit: z.coerce.bigint().positive() });
