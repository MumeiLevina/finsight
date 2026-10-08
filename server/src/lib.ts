import jwt from 'jsonwebtoken';
import { config } from './config.js';
export const signToken = (userId: string) => jwt.sign({ sub: userId }, config.JWT_SECRET, { expiresIn: '30d' });
export const monthRange = (value?: string) => {
  const raw = value ?? new Date().toISOString().slice(0, 7);
  if (!/^\d{4}-\d{2}$/.test(raw)) throw Object.assign(new Error('Tháng phải có định dạng YYYY-MM'), { status: 400 });
  const start = new Date(`${raw}-01T00:00:00.000Z`);
  if (Number.isNaN(start.getTime())) throw Object.assign(new Error('Tháng không hợp lệ'), { status: 400 });
  const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1));
  return { start, end, key: raw };
};
export const json = (value: unknown): unknown => typeof value === 'bigint' ? value.toString() : Array.isArray(value) ? value.map(json) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).map(([k,v]) => [k,json(v)])) : value;
