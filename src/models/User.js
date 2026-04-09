import mongoose from "mongoose";


const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            minLength: [5, 'Minimum length email is 5'],
            maxLength: [100, 'Max length email is 100'],
            required: [true, 'email is required'],
            match: [/\S+@\S+\.\S+/, 'email is invalid']
        },

        password: {
            type: String,
            minLength: [8, 'Minimum length password is 8'],
            maxLength: [100, 'Max length password is 100'],
            required: [true, 'password is required']
        },

        name: {
            type: String,
            minLength: [2, 'Minimum length name is 2'],
            maxLength: [100, 'Max length name is 100'],
        },

        lastName: {
            type: String,
            minLength: [2, 'Minimum length lastName is 2'],
            maxLength: [100, 'Max length lastName is 100'],
        },

        nif: {
            type: String,
            minLength: [2, 'Minimum length nif is 2'],
            maxLength: [20, 'Max length nif is 20'],
        },

        role: {
            type: String,
            enum: ['admin', 'guest'],
            default: 'admin',
        },

        status: {
            type: String,
            enum: ['pending', 'verified'],
        },

        verificationCode: {
            type: String,
            maxLength: [6, 'Max length verificationCode is 6'],
        },

        verificationAttempts: {
            type: Number,
            default: 0,
            min: [0, 'Minimum value verificationAttempts is 0'],
            max: [3, 'Max value verificationAttempts is 3'],
        },

        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
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

userSchema.virtual('fullName').get(function () {
    return `${this.name} ${this.lastName}`;
});

userSchema.index({ email: 1 });
userSchema.index({ company: 1 });
userSchema.index({ status: 1 });
userSchema.index({ role: 1 });

userSchema.set('toJSON', { virtuals: true });

const User = mongoose.model('User', userSchema);

export default User;