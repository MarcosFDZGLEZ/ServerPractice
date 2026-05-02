import mongoose from "mongoose";
import { use } from "react";
import { email, union } from "zod";
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

        client: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Client',
            required: [true, 'client is required']
        },

        name: {
            type: String,
            required: [true, 'name is required'],
        },

        projectCode: {
            type: String,
            unique: true,
            required: [true, 'projectCode is required'],
        },

        address : {
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

        email: {
            type: String,
            required: [true, 'email is required'],
            match: [/\S+@\S+\.\S+/, 'email is invalid']
        },

        notes: {
            type: String,
            maxLength: [500, 'Max length notes is 500'],
        },

        active: {
            type: Boolean,
            default: true,
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
    } ,
    {
        timestamps: true,
        versionKey: false
    }
);

const Project = mongoose.model('Project', clientSchema);
export default Project;