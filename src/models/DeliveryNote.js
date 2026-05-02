import mongoose from 'mongoose';

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
      enum: ['material', 'hours'],
      required: [true, 'format is required']
    },

    description: {
      type: String,
      required: [true, 'description is required']
    },

    workDate: {
      type: Date,
      required: [true, 'workDate is required']
    },

    material: {
      type: String,
      required: function () {
        return this.format === 'material';
      }
    },

    quantity: {
      type: Number,
      required: function () {
        return this.format === 'material';
      }
    },

    unit: {
      type: String,
      required: function () {
        return this.format === 'material';
      }
    },

    hours: {
      type: Number,
      required: function () {
        return this.format === 'hours';
      }
    },

    workers: {
      type: [
        {
          name: {
            type: String,
            required: true
          },
          hours: {
            type: Number,
            required: true
          }
        }
      ],
      required: function () {
        return this.format === 'hours';
      }
    },

    signed: {
      type: Boolean,
      default: false
    },

    signedAt: {
      type: Date
    },

    signatureData: {
      type: String
    },

    pdfPath: {
      type: String
    },

    deleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const DeliveryNote = mongoose.model('DeliveryNote', deliveryNoteSchema);
export default DeliveryNote;