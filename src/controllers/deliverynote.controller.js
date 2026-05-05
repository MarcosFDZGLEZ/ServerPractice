import fs from 'fs';
import DeliveryNote from '../models/DeliveryNote.js';
import Client from '../models/Client.js';
import Project from '../models/Project.js';
import { AppError } from '../utils/AppError.js';
import { emitToCompany } from '../socket.js';
import { generatePdf } from '../services/pdf.service.js';

const parseSort = (sortQuery, defaultSort) => {
  if (!sortQuery) return defaultSort;
  if (sortQuery.startsWith('--')) return { [sortQuery.slice(2)]: -1 };
  if (sortQuery.startsWith('-')) return { [sortQuery.slice(1)]: -1 };
  return { [sortQuery]: 1 };
};

export const createDeliveryNote = async (req, res, next) => {
  try {
    if (!req.user || !req.user.company) {
      throw new AppError('Authenticated user and company are required', 401);
    }

    const { client, project, format, description, workDate, material, quantity, unit, hours, workers } = req.body;

    const [clientDoc, projectDoc] = await Promise.all([
      Client.findOne({ _id: client, company: req.user.company }),
      Project.findOne({ _id: project, company: req.user.company })
    ]);

    if (!clientDoc) {
      throw new AppError('Client not found in your company', 404);
    }
    if (!projectDoc) {
      throw new AppError('Project not found in your company', 404);
    }

    const deliveryNote = await DeliveryNote.create({
      user: req.user.id,
      company: req.user.company,
      client,
      project,
      format,
      description,
      workDate: new Date(workDate),
      material,
      quantity,
      unit,
      hours,
      workers
    });

    emitToCompany(req.user.company, 'deliverynote:new', deliveryNote);
    res.status(201).json(deliveryNote);
  } catch (error) {
    next(error);
  }
};

export const getDeliveryNotes = async (req, res, next) => {
  try {
    if (!req.user || !req.user.company) {
      throw new AppError('Authenticated user and company are required', 401);
    }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const skip = (page - 1) * limit;
    const filterProject = req.query.project || undefined;
    const filterClient = req.query.client || undefined;
    const filterFormat = req.query.format || undefined;
    const filterSigned = req.query.signed === undefined ? undefined : req.query.signed === 'true';
    const sort = parseSort(req.query.sort, { workDate: -1 });
    const from = req.query.from ? new Date(req.query.from) : undefined;
    const to = req.query.to ? new Date(req.query.to) : undefined;

    const query = { company: req.user.company, deleted: false };
    if (filterProject) query.project = filterProject;
    if (filterClient) query.client = filterClient;
    if (filterFormat) query.format = filterFormat;
    if (filterSigned !== undefined) query.signed = filterSigned;
    if (from || to) {
      query.workDate = {};
      if (from && !Number.isNaN(from.getTime())) query.workDate.$gte = from;
      if (to && !Number.isNaN(to.getTime())) query.workDate.$lte = to;
    }

    const [deliveryNotes, totalItems] = await Promise.all([
      DeliveryNote.find(query)
        .populate('user client project')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      DeliveryNote.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      results: deliveryNotes.length,
      totalItems,
      totalPages,
      currentPage: page,
      deliveryNotes
    });
  } catch (error) {
    next(error);
  }
};

export const getDeliveryNote = async (req, res, next) => {
  try {
    if (!req.user || !req.user.company) {
      throw new AppError('Authenticated user and company are required', 401);
    }

    const deliveryNote = await DeliveryNote.findOne({
      _id: req.params.id,
      company: req.user.company,
      deleted: false
    }).populate('user client project');

    if (!deliveryNote) {
      throw new AppError('Delivery note not found', 404);
    }

    res.status(200).json(deliveryNote);
  } catch (error) {
    next(error);
  }
};

export const downloadDeliveryNotePdf = async (req, res, next) => {
  try {
    if (!req.user || !req.user.company) {
      throw new AppError('Authenticated user and company are required', 401);
    }

    const deliveryNote = await DeliveryNote.findOne({
      _id: req.params.id,
      company: req.user.company,
      deleted: false
    }).populate('user client project');

    if (!deliveryNote) {
      throw new AppError('Delivery note not found', 404);
    }

    if (!deliveryNote.pdfPath || !fs.existsSync(deliveryNote.pdfPath)) {
      deliveryNote.pdfPath = await generatePdf(deliveryNote);
      await deliveryNote.save();
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="deliverynote-${deliveryNote._id}.pdf"`);

    const stream = fs.createReadStream(deliveryNote.pdfPath);
    stream.on('error', (err) => next(err));
    stream.pipe(res);
  } catch (error) {
    next(error);
  }
};

export const signDeliveryNote = async (req, res, next) => {
  try {
    // 1. Authorization check
    if (!req.user || !req.user.company) {
      throw new AppError('Authenticated user and company are required', 401);
    }

    // 2. Fetch the delivery note and verify ownership
    const deliveryNote = await DeliveryNote.findOne({
      _id: req.params.id,
      company: req.user.company,
      deleted: false
    }).populate('user client project');

    if (!deliveryNote) {
      throw new AppError('Delivery note not found', 404);
    }

    // 3. Status check
    if (deliveryNote.signed) {
      throw new AppError('Delivery note is already signed', 400);
    }

    // 4. Strict Signature Validation (Fixes image_3b4ce2.png)
    const { signatureData } = req.body;
    
    // Regex ensures the string starts with a valid data URI header
    const base64Regex = /^data:image\/(png|jpg|jpeg);base64,/;

    if (!signatureData || typeof signatureData !== 'string' || !base64Regex.test(signatureData)) {
      throw new AppError('Invalid signature data format. A valid base64 image is required.', 400);
    }

    // 5. Update data
    deliveryNote.signatureData = signatureData;
    deliveryNote.signed = true;
    deliveryNote.signedAt = new Date();

    // 6. Generate PDF with updated signature data
    // Ensure generatePdf is an async function that returns the file path
    deliveryNote.pdfPath = await generatePdf(deliveryNote);

    // 7. Persist changes
    await deliveryNote.save();

    emitToCompany(req.user.company, 'deliverynote:signed', deliveryNote);

    // 8. Respond (Including _id and populated fields as expected by tests)
    res.status(200).json(deliveryNote);

  } catch (error) {
    next(error);
  }
};

export const deleteDeliveryNote = async (req, res, next) => {
  try {
    if (!req.user || !req.user.company) {
      throw new AppError('Authenticated user and company are required', 401);
    }

    const isSoft = req.query.soft !== 'false'; // Default to soft delete if parameter is present
    const query = { _id: req.params.id, company: req.user.company, deleted: false };

    const deliveryNote = await DeliveryNote.findOne(query);

    if (!deliveryNote) {
      throw new AppError('Delivery note not found', 404);
    }

    if (deliveryNote.signed) {
      throw new AppError('Signed delivery notes cannot be deleted', 400);
    }

    if (isSoft) {
      deliveryNote.deleted = true;
      await deliveryNote.save();
    } else {
      await deliveryNote.deleteOne();
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
