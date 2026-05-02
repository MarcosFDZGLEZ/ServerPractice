import { z } from 'zod';

const workerSchema = z.object({
  name: z.string().min(1, 'name is required'),
  hours: z.number().positive('hours must be positive')
});

export const createDeliveryNoteSchema = z.object({
  client: z.string().min(1, 'client is required'),
  project: z.string().min(1, 'project is required'),
  format: z.enum(['material', 'hours']),
  description: z.string().min(1, 'description is required'),
  workDate: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
    message: 'workDate is invalid'
  }),
  material: z.string().min(1, 'material is required').optional(),
  quantity: z.number().positive('quantity must be positive').optional(),
  unit: z.string().min(1, 'unit is required').optional(),
  hours: z.number().positive('hours must be positive').optional(),
  workers: z.array(workerSchema).optional()
}).superRefine((data, ctx) => {
  if (data.format === 'material') {
    if (!data.material || data.quantity === undefined || !data.unit) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'material, quantity and unit are required when format is material'
      });
    }
  }

  if (data.format === 'hours') {
    if (data.hours === undefined && (!data.workers || data.workers.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'hours or workers are required when format is hours'
      });
    }
  }
});

export const signDeliveryNoteSchema = z.object({
  signatureData: z.string().min(1, 'signatureData is required')
});
