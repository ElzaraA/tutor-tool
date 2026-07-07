import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Расширяем тип Request, чтобы добавить поле user
export interface AuthRequest extends Request {
    user?: { id: number; email: string };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
        return res.status(401).json({ error: 'Нет токена. Войдите в систему.' });
        }
        
        // Проверяем токен
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded as { id: number; email: string };
        
        next();
    } catch (error) {
        res.status(401).json({ error: 'Недействительный токен' });
    }
};