import { Response, NextFunction } from 'express';
import { Parser } from 'json2csv';
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  exportLeadsCsv,
  getLeadStats,
} from '../src/controllers/leadsController';
import { Lead } from '../src/models/Lead';

jest.mock('../src/models/Lead', () => ({
  Lead: {
    find: jest.fn(),
    countDocuments: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    aggregate: jest.fn(),
  },
}));

jest.mock('json2csv', () => ({
  Parser: jest.fn().mockImplementation(() => ({
    parse: jest.fn(() => 'name,email'),
  })),
}));

const mockResponse = (): Response => {
  const res = {
    setHeader: jest.fn(),
    status: jest.fn(),
    send: jest.fn(),
    json: jest.fn(),
  } as unknown as Response;

  res.status = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const makeFindChain = (result: unknown) => ({
  sort: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  populate: jest.fn().mockReturnThis(),
  lean: jest.fn().mockResolvedValue(result),
});

describe('leadsController', () => {
  const next: NextFunction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns filtered leads for a sales user', async () => {
    const chain = makeFindChain([{ _id: 'lead-1', name: 'Lead 1' }]);
    jest.mocked(Lead.find).mockReturnValue(chain as never);
    jest.mocked(Lead.countDocuments).mockResolvedValue(1 as never);

    const req = {
      user: { id: 'user-1', email: 'sales@example.com', role: 'sales' },
      query: { page: '1', limit: '10', sort: 'latest' },
    } as never;
    const res = mockResponse();

    await getLeads(req, res, next);

    expect(Lead.find).toHaveBeenCalledWith(expect.objectContaining({ createdBy: 'user-1' }));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  it('returns a lead by id', async () => {
    const lead = {
      _id: 'lead-1',
      createdBy: { toString: () => 'user-1' },
    };

    const secondQuery = {
      populate: jest.fn().mockResolvedValue(lead),
    };
    const firstQuery = {
      populate: jest.fn().mockReturnValue(secondQuery),
    };

    jest.mocked(Lead.findById).mockReturnValue(firstQuery as never);

    const req = {
      params: { id: 'lead-1' },
      user: { id: 'user-1', email: 'sales@example.com', role: 'sales' },
    } as never;
    const res = mockResponse();

    await getLeadById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('creates, updates, deletes, exports and returns stats', async () => {
    jest.mocked(Lead.create).mockResolvedValue({
      populate: jest.fn().mockResolvedValue({ _id: 'lead-1' }),
    } as never);
    jest.mocked(Lead.findById).mockResolvedValue({
      _id: 'lead-1',
      createdBy: { toString: () => 'user-1' },
      populate: jest.fn().mockReturnThis(),
    } as never);
    jest.mocked(Lead.findByIdAndUpdate).mockReturnValue({
      populate: jest.fn().mockResolvedValue({ _id: 'lead-1' }),
    } as never);
    jest.mocked(Lead.findByIdAndDelete).mockResolvedValue({} as never);
    jest.mocked(Lead.aggregate).mockResolvedValueOnce([{ _id: 'New', count: 2 } as never]);
    jest.mocked(Lead.aggregate).mockResolvedValueOnce([{ _id: 'Website', count: 2 } as never]);
    jest.mocked(Lead.countDocuments).mockResolvedValueOnce(2 as never);

    const res = mockResponse();

    await createLead({ user: { id: 'user-1', email: 'sales@example.com', role: 'sales' }, body: { name: 'Lead', email: 'lead@example.com', status: 'New', source: 'Website' } } as never, res, next);
    await updateLead({ user: { id: 'user-1', email: 'sales@example.com', role: 'sales' }, params: { id: 'lead-1' }, body: { name: 'Updated' } } as never, res, next);
    await deleteLead({ user: { id: 'user-1', email: 'sales@example.com', role: 'sales' }, params: { id: 'lead-1' } } as never, res, next);

    await exportLeadsCsv({ user: { id: 'admin-1', email: 'admin@example.com', role: 'admin' }, query: {} } as never, res, next);
    await getLeadStats({ user: { id: 'admin-1', email: 'admin@example.com', role: 'admin' } } as never, res, next);

    expect(Parser).toHaveBeenCalled();
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
    expect(res.status).toHaveBeenCalledWith(200);
  });
});