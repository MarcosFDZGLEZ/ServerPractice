import mongoose from "mongoose";
import { describe } from "zod/v4/core";

const deliveryNoteSchema = new mongoose.Schema(
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

        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: [true, 'project is required']
        },

        format: {
            type: String,
            enum : ['material', 'hours'],
            required: [true, 'format is required']
        },

        description: {
            type: String,
            required: [true, 'description is required']
        },

        workDaate: {
            type: Date,
            required: [true, 'workDaate is required']
        },

        material: {
            type: String,
            required: function() {
                return this.format === 'material';
            }
        },

        quantity: {
            type: Number,
            required: function() {
                return this.format === 'material';
            }
        },

        unit: {
            type: String,
            required: function() {
                return this.format === 'material';
            }
        },

        hours: {
            type: Number,
            required: function() {
                return this.format === 'hours';
            }
        },

        workers: {
            name: {
                type: String,
                required: function() {
                    return this.format === 'hours';
                }
            },
            hours: {
                type: Number,
                required: function() {
                    return this.format === 'hours';
                }
            },
        },

        signed: {
            type: Boolean,
            default: false
        },

        signedAt: {
            type: Date,
        },

        signatureData: {
            type: String,
        },

        pdfPath: {
            type: String,
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

const DeliveryNote = mongoose.model('DeliveryNote', deliveryNoteSchema);
export default DeliveryNote;