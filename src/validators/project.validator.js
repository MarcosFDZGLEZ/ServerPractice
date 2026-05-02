import { z } from 'zod';

const addressSchema = z.object({
    street: z.string().min(1, 'street is required'),
    number: z.string().min(1, 'number is required'),
    postal: z.string().min(1, 'postal is required'),
    city: z.string().min(1, 'city is required'),
    province: z.string().min(1, 'province is required')
});

export const createProjectSchema = z.object({
    name: z.string().min(1, 'name is required'),
    projectCode: z.string().min(1, 'projectCode is required'),
    email: z.string().email('email is invalid'),
    address: addressSchema,
    client: z.string().min(1, 'client is required')
});

export const updateProjectSchema = createProjectSchema;