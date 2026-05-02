import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import DeliveryNote from '../models/DeliveryNote.js';
import Client from '../models/Client.js';
import Project from '../models/Project.js';
import { AppError } from '../utils/AppError.js';

const parseSort = (sortQuery, defaultSort) => {
  if (!sortQuery) return defaultSort;
  if (sortQuery.startsWith('--')) return { [sortQuery.slice(2)]: -1 };
  if (sortQuery.startsWith('-')) return { [sortQuery.slice(1)]: -1 };
  return { [sortQuery]: 1 };
};

const getPdfDirectory = () => {
  return path.join(process.cwd(), 'uploads', 'deliverynotes');
};

const ensurePdfDirectory = async () => {
  const pdfDir = getPdfDirectory();
  await fs.promises.mkdir(pdfDir, { recursive: true });
  return pdfDir;
};

const generatePdf = async (note) => {
  const pdfDir = await ensurePdfDirectory();
  const pdfPath = path.join(pdfDir, `${note._id}.pdf`);
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  const writeStream = fs.createWriteStream(pdfPath);

  doc.pipe(writeStream);

  doc.fontSize(18).text('Delivery Note', { align: 'center' });
  doc.moveDown();

  doc.fontSize(12).text(`ID: ${note._id}`);
  doc.text(`Project: ${note.project?.name || note.project}`);
  doc.text(`Client: ${note.client?.name || note.client}`);
  doc.text(`User: ${note.user?.email || note.user?.name || note.user}`);
  doc.text(`Format: ${note.format}`);
  doc.text(`Work Date: ${new Date(note.workDate).toLocaleDateString()}`);
  doc.moveDown();

  doc.text('Description:', { underline: true });
  doc.text(note.description || '');
  doc.moveDown();

  if (note.format === 'material') {
    doc.text('Material details:', { underline: true });
    doc.text(`Material: ${note.material || '-'}`);
    doc.text(`Quantity: ${note.quantity ?? '-'}`);
    doc.text(`Unit: ${note.unit || '-'}`);
  }

  if (note.format === 'hours') {
    doc.text('Hours details:', { underline: true });
    if (note.hours !== undefined) {
      doc.text(`Total hours: ${note.hours}`);
    }
    if (Array.isArray(note.workers) && note.workers.length > 0) {
      doc.moveDown();
      doc.text('Workers:', { underline: true });
      note.workers.forEach((worker, index) => {
        doc.text(`${index + 1}. ${worker.name} - ${worker.hours}h`);
      });
    }
  }

  doc.moveDown();
  doc.text(`Signed: ${note.signed ? 'Yes' : 'No'}`);
  if (note.signed && note.signedAt) {
    doc.text(`Signed At: ${new Date(note.signedAt).toLocaleString()}`);
  }

  if (note.signed && note.signatureData) {
    try {
      const base64Data = note.signatureData.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      doc.addPage().fontSize(14).text('Signature', { align: 'center' });
      doc.image(buffer, { fit: [300, 150], align: 'center' });
    } catch (err) {
      doc.moveDown();
      doc.text('Signature data could not be rendered.');
    }
  }

  doc.end();

  await new Promise((resolve, reject) => {
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });

  return pdfPath;
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

    if (deliveryNote.signed) {
      throw new AppError('Delivery note is already signed', 400);
    }

    deliveryNote.signatureData = req.body.signatureData;
    deliveryNote.signed = true;
    deliveryNote.signedAt = new Date();
    deliveryNote.pdfPath = await generatePdf(deliveryNote);
    await deliveryNote.save();

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

    const deliveryNote = await DeliveryNote.findOne({
      _id: req.params.id,
      company: req.user.company,
      deleted: false
    });

    if (!deliveryNote) {
      throw new AppError('Delivery note not found', 404);
    }

    if (deliveryNote.signed) {
      throw new AppError('Signed delivery notes cannot be deleted', 400);
    }

    const hardDelete = req.query.hard === 'true';
    if (hardDelete) {
      await deliveryNote.deleteOne();
    } else {
      deliveryNote.deleted = true;
      await deliveryNote.save();
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
