import Project from '../models/Project.js';
import Client from '../models/Client.js';
import { AppError } from '../utils/AppError.js';

const buildQuery = (company, includeDeleted = false, filterName, filterClient, filterActive) => {
    const query = { company, deleted: includeDeleted };

    if (filterName) {
        query.name = { $regex: filterName, $options: 'i' };
    }

    if (filterClient) {
        query.client = filterClient;
    }

    if (typeof filterActive === 'boolean') {
        query.active = filterActive;
    }

    return query;
};

const parseSort = (sortQuery) => {
    if (!sortQuery) return { createdAt: -1 };
    if (sortQuery.startsWith('--')) return { [sortQuery.slice(2)]: -1 };
    if (sortQuery.startsWith('-')) return { [sortQuery.slice(1)]: -1 };
    return { [sortQuery]: 1 };
};

export const createProject = async (req, res, next) => {
    try {
        const { name, projectCode, address, email, client } = req.body;

        if (!req.user || !req.user.company) {
            throw new AppError('Authenticated user and company are required', 401);
        }

        const clientExists = await Client.findOne({ _id: client, company: req.user.company });
        if (!clientExists) {
            throw new AppError('Client not found in your company', 404);
        }

        const existingProject = await Project.findOne({ company: req.user.company, projectCode });
        if (existingProject) {
            throw new AppError('A project with that code already exists in your company', 409);
        }

        const project = await Project.create({
            user: req.user.id,
            company: req.user.company,
            client,
            name,
            projectCode,
            address,
            email
        });

        res.status(201).json(project);
    } catch (error) {
        next(error);
    }
};

export const getProjects = async (req, res, next) => {
    try {
        if (!req.user || !req.user.company) {
            throw new AppError('Authenticated user and company are required', 401);
        }

        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
        const skip = (page - 1) * limit;
        const filterName = req.query.name || null;
        const filterClient = req.query.client || null;
        const filterActive = req.query.active === undefined ? undefined : req.query.active === 'true';
        const sort = parseSort(req.query.sort);

        const query = buildQuery(req.user.company, false, filterName, filterClient, filterActive);
        const [projects, totalItems] = await Promise.all([
            Project.find(query).sort(sort).skip(skip).limit(limit),
            Project.countDocuments(query)
        ]);
        const totalPages = Math.ceil(totalItems / limit);

        res.status(200).json({
            results: projects.length,
            totalItems,
            totalPages,
            currentPage: page,
            projects
        });
    } catch (error) {
        next(error);
    }
};

export const getArchivedProjects = async (req, res, next) => {
    try {
        if (!req.user || !req.user.company) {
            throw new AppError('Authenticated user and company are required', 401);
        }

        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
        const skip = (page - 1) * limit;
        const filterName = req.query.name || null;
        const filterClient = req.query.client || null;
        const sort = parseSort(req.query.sort);

        const query = buildQuery(req.user.company, true, filterName, filterClient);
        const [projects, totalItems] = await Promise.all([
            Project.find(query).sort(sort).skip(skip).limit(limit),
            Project.countDocuments(query)
        ]);
        const totalPages = Math.ceil(totalItems / limit);

        res.status(200).json({
            results: projects.length,
            totalItems,
            totalPages,
            currentPage: page,
            projects
        });
    } catch (error) {
        next(error);
    }
};

export const getProject = async (req, res, next) => {
    try {
        if (!req.user || !req.user.company) {
            throw new AppError('Authenticated user and company are required', 401);
        }

        const project = await Project.findOne({ _id: req.params.id, company: req.user.company, deleted: false });
        if (!project) {
            throw new AppError('Project not found', 404);
        }

        res.status(200).json(project);
    } catch (error) {
        next(error);
    }
};

export const updateProject = async (req, res, next) => {
    try {
        if (!req.user || !req.user.company) {
            throw new AppError('Authenticated user and company are required', 401);
        }

        if (req.body.client) {
            const clientExists = await Client.findOne({ _id: req.body.client, company: req.user.company });
            if (!clientExists) {
                throw new AppError('Client not found in your company', 404);
            }
        }

        if (req.body.projectCode) {
            const existingProject = await Project.findOne({
                company: req.user.company,
                projectCode: req.body.projectCode,
                _id: { $ne: req.params.id }
            });
            if (existingProject) {
                throw new AppError('A project with that code already exists in your company', 409);
            }
        }

        const project = await Project.findOneAndUpdate(
            { _id: req.params.id, company: req.user.company },
            req.body,
            { new: true, runValidators: true }
        );

        if (!project) {
            throw new AppError('Project not found', 404);
        }

        res.status(200).json(project);
    } catch (error) {
        next(error);
    }
};

export const deleteProject = async (req, res, next) => {
    try {
        if (!req.user || !req.user.company) {
            throw new AppError('Authenticated user and company are required', 401);
        }

        const isSoft = req.query.soft === 'true';
        let project;

        if (isSoft) {
            project = await Project.findOneAndUpdate(
                { _id: req.params.id, company: req.user.company },
                { deleted: true },
                { new: true }
            );
        } else {
            project = await Project.findOneAndDelete({ _id: req.params.id, company: req.user.company });
        }

        if (!project) {
            throw new AppError('Project not found', 404);
        }

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export const restoreProject = async (req, res, next) => {
    try {
        if (!req.user || !req.user.company) {
            throw new AppError('Authenticated user and company are required', 401);
        }

        const project = await Project.findOneAndUpdate(
            { _id: req.params.id, company: req.user.company, deleted: true },
            { deleted: false },
            { new: true }
        );

        if (!project) {
            throw new AppError('Project not found or not deleted', 404);
        }

        res.status(200).json(project);
    } catch (error) {
        next(error);
    }
};