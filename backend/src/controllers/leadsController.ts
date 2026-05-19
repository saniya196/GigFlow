/// <reference path="../types/json2csv.d.ts" />

import { Response, NextFunction } from 'express';
import { FilterQuery, Types } from 'mongoose';
import { Parser } from 'json2csv';
import { Lead } from '../models/Lead';
import { AuthenticatedRequest, CreateLeadDto, ILead, LeadFilterQuery, UpdateLeadDto } from '../types';
import { buildPaginationMeta, sendCreated, sendSuccess } from '../utils/response';
import { AppError } from '../middleware/errorHandler';

const DEFAULT_LIMIT = 10;

export const getLeads = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      status,
      source,
      search,
      sort = 'latest',
      page = '1',
      limit = String(DEFAULT_LIMIT),
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter: FilterQuery<ILead> = {};

    if (req.user?.role === 'sales') {
      filter['createdBy'] = req.user.id;
    }

    if (status) filter['status'] = status;
    if (source) filter['source'] = source;

    if (search?.trim()) {
      filter['$or'] = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const sortOrder = sort === 'oldest' ? 1 : -1;

    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .populate('createdBy', 'name email')
        .populate('assignedTo', 'name email')
        .lean(),
      Lead.countDocuments(filter),
    ]);

    const meta = buildPaginationMeta(pageNum, limitNum, total);
    sendSuccess(res, { leads }, 'Leads retrieved successfully', 200, meta);
  } catch (error) {
    next(error);
  }
};

export const getLeadById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params['id'])
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!lead) throw new AppError('Lead not found', 404);

    if (req.user?.role === 'sales' && lead.createdBy.toString() !== req.user.id) {
      throw new AppError('Forbidden', 403);
    }

    sendSuccess(res, { lead }, 'Lead retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createLead = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);

    const dto = req.body as CreateLeadDto;
    const lead = await Lead.create({ ...dto, createdBy: req.user.id });
    const populatedLead = await lead.populate('createdBy', 'name email');

    sendCreated(res, { lead: populatedLead }, 'Lead created successfully');
  } catch (error) {
    next(error);
  }
};

export const updateLead = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params['id']);
    if (!lead) throw new AppError('Lead not found', 404);

    if (req.user?.role === 'sales' && lead.createdBy.toString() !== req.user?.id) {
      throw new AppError('Forbidden', 403);
    }

    const dto = req.body as UpdateLeadDto;
    const updatedLead = await Lead.findByIdAndUpdate(
      req.params['id'],
      { $set: dto },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    sendSuccess(res, { lead: updatedLead }, 'Lead updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteLead = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params['id']);
    if (!lead) throw new AppError('Lead not found', 404);

    if (req.user?.role === 'sales' && lead.createdBy.toString() !== req.user?.id) {
      throw new AppError('Forbidden', 403);
    }

    await Lead.findByIdAndDelete(req.params['id']);
    sendSuccess(res, null, 'Lead deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const exportLeadsCsv = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (req.user?.role !== 'admin') throw new AppError('Only admins can export leads', 403);

    const { status, source, search, sort = 'latest' } = req.query as LeadFilterQuery;
    const filter: FilterQuery<ILead> = {};

    if (status) filter['status'] = status;
    if (source) filter['source'] = source;
    if (search?.trim()) {
      filter['$or'] = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const leads = await Lead.find(filter)
      .sort({ createdAt: sort === 'oldest' ? 1 : -1 })
      .populate('createdBy', 'name email')
      .lean();

    const fields = ['name', 'email', 'status', 'source', 'notes', 'createdAt'];
    const parser = new Parser({ fields });
    const csv = parser.parse(leads);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="leads.csv"');
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

export const getLeadStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const matchStage = req.user?.role === 'sales'
      ? { createdBy: new Types.ObjectId(req.user.id) }
      : {};

    const [statusStats, sourceStats, totalCount] = await Promise.all([
      Lead.aggregate([
        { $match: matchStage },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Lead.aggregate([
        { $match: matchStage },
        { $group: { _id: '$source', count: { $sum: 1 } } },
      ]),
      Lead.countDocuments(matchStage),
    ]);

    sendSuccess(res, { totalCount, statusStats, sourceStats }, 'Stats retrieved');
  } catch (error) {
    next(error);
  }
};
