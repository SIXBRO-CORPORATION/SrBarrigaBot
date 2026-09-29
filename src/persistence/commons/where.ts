import {PaymentStatus} from '../../../generated/prisma/enums.js';

export const ACTIVE_STUDENT = {deletedAt: null, active: true};
export const APPROVED_PAYMENT = {status: PaymentStatus.APPROVED, deletedAt: null};
