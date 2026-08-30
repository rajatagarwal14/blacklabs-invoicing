import { type Express, type Request, type Response } from 'express';
import * as currenciesService from '../../shared/services/currencies';
import { dbInstance } from '../database';
import { parseFilter, requireDB } from '../utils/functions';

export const initCurrenciesController = (app: Express) => {
  app.get('/api/currencies', requireDB, async (req: Request, res: Response) => {
    const filter = parseFilter(req.query.filter as string);
    const result = await currenciesService.getAllCurrencies(dbInstance!, filter);
    res.json(result);
  });
  app.post('/api/currencies', requireDB, async (req: Request, res: Response) => {
    const result = await currenciesService.addCurrency(dbInstance!, req.body);
    res.json(result);
  });
  app.put('/api/currencies', requireDB, async (req: Request, res: Response) => {
    const result = await currenciesService.updateCurrency(dbInstance!, req.body);
    res.json(result);
  });
  app.delete('/api/currencies/:id', requireDB, async (req: Request, res: Response) => {
    const result = await currenciesService.deleteCurrency(dbInstance!, Number(req.params.id));
    res.json(result);
  });
  app.post('/api/currencies/batch', requireDB, async (req: Request, res: Response) => {
    const result = await currenciesService.batchAddCurrency(dbInstance!, req.body);
    res.json(result);
  });
};
