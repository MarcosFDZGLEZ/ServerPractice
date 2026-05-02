import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email().transform(val => val.toLowerCase().trim()),
  password: z.string().min(8, "The password must be at least 8 characters long")
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export const validationSchema = z.object({
  code: z.string().length(6)
});


export const onboardingSchema = z.object({
  name: z.string().min(2),
  lastName: z.string().min(2),
  nif: z.string().min(8)
});

export const companySchema = z.object({
  name: z.string(),
  cif: z.string(),
  isFreelance: z.boolean(),
  address: z.object({
    street: z.string(),
    number: z.string(),
    postal: z.string(),
    city: z.string(),
    province: z.string()
  })
});