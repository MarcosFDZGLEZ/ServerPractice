import { z } from 'zod';

const addressSchema = z.object({
  street: z.string().min(1, 'street is required'),
  number: z.string().min(1, 'number is required'),
  postal: z.string().min(1, 'postal is required'),
  city: z.string().min(1, 'city is required'),
  province: z.string().min(1, 'province is required')
});

export const createClientSchema = z.object({
  name: z.string().min(1, 'name is required'),
  cif: z.string().min(1, 'cif is required'),
  email: z.string().email('email is invalid'),
  phone: z.string().min(1, 'phone is required'),
  address: addressSchema
});

export const updateClientSchema = createClientSchema;
