import { type Express, type Request, type Response } from 'express';
import * as itemsService from '../../shared/services/items';
import { dbInstance } from '../database';
import { parseFilter, requireDB } from '../utils/functions';

export const initItemsController = (app: Express) => {
  app.get('/api/items', requireDB, async (req: Request, res: Response) => {
    const filter = parseFilter(req.query.filter as string);
    const result = await itemsService.getAllItems(dbInstance!, filter);
    res.json(result);
  });
  app.post('/api/items', requireDB, async (req: Request, res: Response) => {
    const result = await itemsService.addItem(dbInstance!, req.body);
    res.json(result);
  });
  app.put('/api/items', requireDB, async (req: Request, res: Response) => {
    const result = await itemsService.updateItem(dbInstance!, req.body);
    res.json(result);
  });
  app.delete('/api/items/:id', requireDB, async (req: Request, res: Response) => {
    const result = await itemsService.deleteItem(dbInstance!, Number(req.params.id));
    res.json(result);
  });
  app.post('/api/items/batch', requireDB, async (req: Request, res: Response) => {
    const result = await itemsService.batchAddItem(dbInstance!, req.body);
    res.json(result);
  });
};
