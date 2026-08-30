import type { DatabaseAdapter } from '../types/DatabaseAdapter';
import { mapDatabaseError } from '../utils/errorFunctions';

export const up = async (db: DatabaseAdapter) => {
  try {
    await db.run(`
      UPDATE style_profiles
      SET "fontFamily" = 'Roboto'
      WHERE "fontFamily" IS NULL;
    `);
  } catch (error) {
    return { success: false, ...mapDatabaseError(error, db.type) };
  }
};
