import { z } from 'zod';

export const plantSchema = z.object({
  id: z.string().optional(),
  scientificName: z.string().min(1, 'Scientific name is required'),
  commonName: z.string().min(1, 'Common name is required'),
  family: z.string().min(1, 'Family is required'),
  status: z.enum(['active', 'inactive', 'archived']).default('active'),
  location: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.string().or(z.date()).optional(),
  updatedAt: z.string().or(z.date()).optional()
});

export const auditSchema = z.object({
  id: z.string().optional(),
  plantId: z.string().min(1, 'Plant ID is required'),
  auditDate: z.string().or(z.date()),
  auditor: z.string().min(1, 'Auditor name is required'),
  findings: z.string().optional(),
  status: z.enum(['pending', 'completed', 'reviewed']).default('pending'),
  createdAt: z.string().or(z.date()).optional()
});

export type Plant = z.infer<typeof plantSchema>;
export type Audit = z.infer<typeof auditSchema>;
