import type { DatabaseAdapter } from '../types/DatabaseAdapter';
import { getTableColumns } from '../utils/dbHelper';
import { mapDatabaseError } from '../utils/errorFunctions';

export const up = async (db: DatabaseAdapter) => {
  try {
    const cols = await getTableColumns(db, 'style_profiles');
    const colInfo = cols.find(c => c.name === 'fontSize');

    if (colInfo) {
      return;
    }

    await db.run(`ALTER TABLE style_profiles RENAME COLUMN "customizationLayout" TO "layout";`);
    await db.run(`ALTER TABLE style_profiles RENAME COLUMN "customizationColor" TO "color";`);
    await db.run(`ALTER TABLE style_profiles RENAME COLUMN "customizationLogoSize" TO "logoSize";`);
    await db.run(`ALTER TABLE style_profiles RENAME COLUMN "customizationFontSizeSize" TO "fontSize";`);
    await db.run(`ALTER TABLE style_profiles RENAME COLUMN "customizationTableHeaderStyle" TO "tableHeaderStyle";`);
    await db.run(`ALTER TABLE style_profiles RENAME COLUMN "customizationTableRowStyle" TO "tableRowStyle";`);
    await db.run(`ALTER TABLE style_profiles RENAME COLUMN "customizationPageFormat" TO "pageFormat";`);
    await db.run(`ALTER TABLE style_profiles RENAME COLUMN "customizationLabelUpperCase" TO "labelUpperCase";`);
    await db.run(`ALTER TABLE style_profiles RENAME COLUMN "customizationWatermarkFileName" TO "watermarkFileName";`);
    await db.run(`ALTER TABLE style_profiles RENAME COLUMN "customizationWatermarkFileType" TO "watermarkFileType";`);
    await db.run(`ALTER TABLE style_profiles RENAME COLUMN "customizationWatermarkFileSize" TO "watermarkFileSize";`);
    await db.run(`ALTER TABLE style_profiles RENAME COLUMN "customizationWatermarkFileData" TO "watermarkFileData";`);
    await db.run(
      `ALTER TABLE style_profiles RENAME COLUMN "customizationPaidWatermarkFileName" TO "paidWatermarkFileName";`
    );
    await db.run(
      `ALTER TABLE style_profiles RENAME COLUMN "customizationPaidWatermarkFileType" TO "paidWatermarkFileType";`
    );
    await db.run(
      `ALTER TABLE style_profiles RENAME COLUMN "customizationPaidWatermarkFileSize" TO "paidWatermarkFileSize";`
    );
    await db.run(
      `ALTER TABLE style_profiles RENAME COLUMN "customizationPaidWatermarkFileData" TO "paidWatermarkFileData";`
    );
  } catch (error) {
    return { success: false, ...mapDatabaseError(error, db.type) };
  }
};
