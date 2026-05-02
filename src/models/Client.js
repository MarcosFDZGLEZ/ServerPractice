import mongoose from "mongoose";
import { required } from "zod/mini";

const clientSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'user is required']
        },

        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
            required: [true, 'company is required']
        },

        name: {
            type: String,
            required: [true, 'name is required'],
        },

        cif: {
            type: String,
            required: [true, 'cif is required'],
        },

        email: {
            type: String,
            required: [true, 'email is required'],
            match: [/\S+@\S+\.\S+/, 'email is invalid']
        },

        phone: {
            type: String,
            required: [true, 'phone is required'],
        },

        address: {
            street: {
                type: String,
                required: [true, 'street is required'],
            },
            number: {
                type: String,
                required: [true, 'number is required'],
            },
            postal: {
                type: String,
                required: [true, 'postal is required'],
            },
            city: {
                type: String,
                required: [true, 'city is required'],
            },
            province: {
                type: String,
                required: [true, 'province is required'],
            },
        },

        deleted: {
            type: Boolean,
            default: false,
        },

        createdAt: {
            type: Date,
            default: Date.now,
        },

        updatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const Client = mongoose.model('Client', clientSchema);

export default Client;