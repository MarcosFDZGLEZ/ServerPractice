import Client from '../models/Client.js';
import { AppError } from '../utils/AppError.js';

const buildQuery = (company, includeDeleted = false, filterName) => {
  const query = { company };
  query.deleted = includeDeleted;

  if (filterName) {
    query.name = { $regex: filterName, $options: 'i' };
  }

  return query;
};

export const createClient = async (req, res, next) => {
  try {
    const { name, cif, email, phone, address } = req.body;

    if (!req.user || !req.user.company) {
      throw new AppError('Authenticated user and company are required', 401);
    }

    const existingClient = await Client.findOne({ company: req.user.company, cif });
    if (existingClient) {
      throw new AppError('A client with that tax ID already exists in your company', 409);
    }

    const client = await Client.create({
      user: req.user.id,
      company: req.user.company,
      name,
      cif,
      email,
      phone,
      address
    });

    res.status(201).json(client);
  } catch (error) {
    next(error);
  }
};

export const getClients = async (req, res, next) => {
  try {
    if (!req.user || !req.user.company) {
      throw new AppError('Authenticated user and company are required', 401);
    }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const skip = (page - 1) * limit;
    const filterName = req.query.name || null;
    const sort = req.query.sort === 'createdAt' ? { createdAt: 1 } : { createdAt: -1 };

    const query = buildQuery(req.user.company, false, filterName);
    const [clients, totalItems] = await Promise.all([
      Client.find(query).sort(sort).skip(skip).limit(limit),
      Client.countDocuments(query)
    ]);
    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      results: clients.length,
      totalItems,
      totalPages,
      currentPage: page,
      clients
    });
  } catch (error) {
    next(error);
  }
};

export const getArchivedClients = async (req, res, next) => {
  try {
    if (!req.user || !req.user.company) {
      throw new AppError('Authenticated user and company are required', 401);
    }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const skip = (page - 1) * limit;
    const filterName = req.query.name || null;
    const sort = req.query.sort === 'createdAt' ? { createdAt: 1 } : { createdAt: -1 };

    const query = buildQuery(req.user.company, true, filterName);
    const [clients, totalItems] = await Promise.all([
      Client.find(query).sort(sort).skip(skip).limit(limit),
      Client.countDocuments(query)
    ]);
    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      results: clients.length,
      totalItems,
      totalPages,
      currentPage: page,
      clients
    });
  } catch (error) {
    next(error);
  }
};

export const getClient = async (req, res, next) => {
  try {
    if (!req.user || !req.user.company) {
      throw new AppError('Authenticated user and company are required', 401);
    }

    const client = await Client.findOne({
      _id: req.params.id,
      company: req.user.company,
      deleted: false
    });

    if (!client) {
      throw AppError.notFound('Client not found');
    }

    res.status(200).json(client);
  } catch (error) {
    next(error);
  }
};

export const updateClient = async (req, res, next) => {
  try {
    if (!req.user || !req.user.company) {
      throw new AppError('Authenticated user and company are required', 401);
    }

    const existingClient = await Client.findOne({
      company: req.user.company,
      cif: req.body.cif,
      _id: { $ne: req.params.id }
    });
    if (existingClient) {
      throw new AppError('A client with that tax ID already exists in your company', 409);
    }

    const client = await Client.findOneAndUpdate(
      {
        _id: req.params.id,
        company: req.user.company
      },
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!client) {
      throw AppError.notFound('Client not found');
    }

    res.status(200).json(client);
  } catch (error) {
    next(error);
  }
};

export const restoreClient = async (req, res, next) => {
  try {
    if (!req.user || !req.user.company) {
      throw new AppError('Authenticated user and company are required', 401);
    }

    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, company: req.user.company, deleted: true },
      { deleted: false },
      { new: true }
    );

    if (!client) {
      throw AppError.notFound('Archived client not found');
    }

    res.status(200).json(client);
  } catch (error) {
    next(error);
  }
};

export const deleteClient = async (req, res, next) => {
  try {
    if (!req.user || !req.user.company) {
      throw new AppError('Authenticated user and company are required', 401);
    }

    const isSoft = req.query.soft === 'true';
    let client;

    if (isSoft) {
      client = await Client.findOneAndUpdate(
        { _id: req.params.id, company: req.user.company },
        { deleted: true },
        { new: true }
      );
    } else {
      client = await Client.findOneAndDelete({ _id: req.params.id, company: req.user.company });
    }

    if (!client) {
      throw AppError.notFound('Client not found');
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};