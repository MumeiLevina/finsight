import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { signToken } from '../lib.js';
import { auth } from '../middleware.js';
import { authSchema } from '../validation.js';
export const authRoutes = Router();
authRoutes.post('/register', async (req,res) => {
  const data = authSchema.extend({ name: authSchema.shape.name.unwrap() }).parse(req.body);
  if (await db.user.findUnique({ where: { email: data.email.toLowerCase() } })) return res.status(409).json({ message: 'Email đã được sử dụng' });
  const user = await db.user.create({ data: { name: data.name, email: data.email.toLowerCase(), passwordHash: await bcrypt.hash(data.password, 12) } });
  res.status(201).json({ token: signToken(user.id), user: { id:user.id,name:user.name,email:user.email } });
});
authRoutes.post('/login', async (req,res) => {
  const data = authSchema.omit({name:true}).parse(req.body); const user = await db.user.findUnique({ where:{email:data.email.toLowerCase()} });
  if (!user || !await bcrypt.compare(data.password,user.passwordHash)) return res.status(401).json({message:'Email hoặc mật khẩu không đúng'});
  res.json({token:signToken(user.id),user:{id:user.id,name:user.name,email:user.email}});
});
authRoutes.get('/me', auth, async (req,res) => { const user=await db.user.findUnique({where:{id:req.userId},select:{id:true,name:true,email:true,createdAt:true}}); res.json({user}); });
