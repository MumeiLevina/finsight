import type { ErrorRequestHandler, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { ZodError } from 'zod';
import { config } from './config.js';

export const auth: RequestHandler = (req, res, next) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ message: 'Bạn cần đăng nhập' });
  try { req.userId = String(jwt.verify(token, config.JWT_SECRET).sub); next(); }
  catch { res.status(401).json({ message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn' }); }
};
export const notFound: RequestHandler = (_req, res) => { res.status(404).json({ message: 'Không tìm thấy tài nguyên' }); };
export const errors: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) return res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors: error.flatten().fieldErrors });
  const status = Number(error.status) || 500;
  if (status === 500) console.error(error);
  res.status(status).json({ message: status === 500 ? 'Đã có lỗi máy chủ' : error.message });
};
