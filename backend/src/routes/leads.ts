import { Router } from 'express';
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  exportLeadsCsv,
  getLeadStats,
} from '../controllers/leadsController';
import { authenticate, authorize } from '../middleware/auth';
import {
  createLeadValidation,
  updateLeadValidation,
  leadsQueryValidation,
} from '../middleware/validation';
import { param } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation';
import { wrapAsync } from '../utils/asyncHandler';

const router = Router();

router.use(authenticate);

router.get('/', ...leadsQueryValidation, wrapAsync(getLeads));
router.get('/stats', wrapAsync(getLeadStats));
router.get('/export', authorize('admin'), wrapAsync(exportLeadsCsv));
router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid lead ID'), handleValidationErrors],
  wrapAsync(getLeadById)
);
router.post('/', ...createLeadValidation, wrapAsync(createLead));
router.put('/:id', ...updateLeadValidation, wrapAsync(updateLead));
router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid lead ID'), handleValidationErrors],
  wrapAsync(deleteLead)
);

export default router;
