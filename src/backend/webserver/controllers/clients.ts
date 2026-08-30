import { type Express, type Request, type Response } from 'express';
import * as clientsService from '../../shared/services/clients';
import { dbInstance } from '../database';
import { parseFilter, requireDB } from '../utils/functions';

export const initClientsController = (app: Express) => {
  app.get('/api/clients', requireDB, async (req: Request, res: Response) => {
    const filter = parseFilter(req.query.filter as string);
    const result = await clientsService.getAllClients(dbInstance!, filter);
    res.json(result);
  });
  app.post('/api/clients', requireDB, async (req: Request, res: Response) => {
    const result = await clientsService.addClient(dbInstance!, req.body);
    res.json(result);
  });
  app.put('/api/clients', requireDB, async (req: Request, res: Response) => {
    const result = await clientsService.updateClient(dbInstance!, req.body);
    res.json(result);
  });
  app.delete('/api/clients/:id', requireDB, async (req: Request, res: Response) => {
    const result = await clientsService.deleteClient(dbInstance!, Number(req.params.id));
    res.json(result);
  });
  app.post('/api/clients/batch', requireDB, async (req: Request, res: Response) => {
    const result = await clientsService.batchAddClient(dbInstance!, req.body);
    res.json(result);
  });
};
