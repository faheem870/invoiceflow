import { Router } from 'express';
import invoiceRoutes from './invoices';
import userRoutes from './users';
import paymentRoutes from './payments';
import marketplaceRoutes from './marketplace';
import aiRoutes from './ai';
import researchRoutes from './research';
import uploadRoutes from './upload';
import notificationRoutes from './notifications';

export const router = Router();

router.use('/invoices', invoiceRoutes);
router.use('/users', userRoutes);
router.use('/payments', paymentRoutes);
router.use('/marketplace', marketplaceRoutes);
router.use('/ai', aiRoutes);
router.use('/research', researchRoutes);
router.use('/upload', uploadRoutes);
router.use('/notifications', notificationRoutes);
