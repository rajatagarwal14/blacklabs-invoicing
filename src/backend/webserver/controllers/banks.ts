import { type Express, type Request, type Response } from 'express';
import * as banksService from '../../shared/services/banks';
import { decodeBank, encodeResultBank } from '../../shared/utils/dataUrlFunctions';
import { dbInstance } from '../database';
import { parseFilter, requireDB } from '../utils/functions';

export const initBanksController = (app: Express) => {
  app.get('/api/banks', requireDB, async (req: Request, res: Response) => {
    const filter = parseFilter(req.query.filter as string);
    const result = await banksService.getAllBanks(dbInstance!, filter);
    res.json(encodeResultBank(result));
  });
  app.post('/api/banks', requireDB, async (req: Request, res: Response) => {
    const result = await banksService.addBank(dbInstance!, decodeBank(req.body));
    res.json(encodeResultBank(result));
  });
  app.put('/api/banks', requireDB, async (req: Request, res: Response) => {
    const result = await banksService.updateBank(dbInstance!, decodeBank(req.body));
    res.json(encodeResultBank(result));
  });
  app.delete('/api/banks/:id', requireDB, async (req: Request, res: Response) => {
    const result = await banksService.deleteBank(dbInstance!, Number(req.params.id));
    res.json(result);
  });
  app.post('/api/banks/batch', requireDB, async (req: Request, res: Response) => {
    const result = await banksService.batchAddBank(dbInstance!, req.body);
    res.json(result);
  });
};
