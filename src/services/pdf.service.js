import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

const getPdfDirectory = () => {
  return path.join(process.cwd(), 'uploads', 'deliverynotes');
};

const ensurePdfDirectory = async () => {
  const pdfDir = getPdfDirectory();
  await fs.promises.mkdir(pdfDir, { recursive: true });
  return pdfDir;
};

export const generatePdf = async (note) => {
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
