import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'owner is required']
        },

        name: {
            type: String,
            minLength: [2, 'Minimum length name is 2'],
            maxLength: [100, 'Max length name is 100'],
            required: [true, 'name is required']
        },

        cif: {
            type: String,
            minLength: [2, 'Minimum length cif is 2'],
            maxLength: [20, 'Max length cif is 20'],
            required: [true, 'cif is required']
        },

        address: {
            street: {
                type: String,
                minLength: [2, 'Minimum length street is 2'],
                maxLength: [100, 'Max length street is 100'],
            },
            number: {
                type: String,
                minLength: [1, 'Minimum length number is 1'],
                maxLength: [10, 'Max length number is 10'],
            },
            postal: {
                type: String,
                minLength: [2, 'Minimum length postal is 2'],
                maxLength: [10, 'Max length postal is 10'],
            },
            city: {
                type: String,
                minLength: [2, 'Minimum length city is 2'],
                maxLength: [100, 'Max length city is 100'],
            },
            province: {
                type: String,
                minLength: [2, 'Minimum length province is 2'],
                maxLength: [100, 'Max length province is 100'],
            },
        },

        logo: {
            type: String,
            minLength: [2, 'Minimum length logo is 2'],
            maxLength: [200, 'Max length logo is 200'],
        },

        isFreelance: {
            type: Boolean,
            required: [true, 'isFreeLance is required']
        },

        deleted: {
            type: Boolean,
            default: false
        },

        createdAt: {
            type: Date,
            default: Date.now
        },

        updatedAt: {
            type: Date,
            default: Date.now
        },

    },
    {
        timestamps: true,
        versionKey: false
    }
);

const Company = mongoose.model('Company', companySchema);

export default Company;

