import fs from 'fs';
import path from 'path';

const src = path.resolve('src/backend/webserver/package.json');
const dest = path.resolve('dist-be/backend/server/package.json');

fs.copyFileSync(src, dest);
console.log('Copied webserver package.json → dist-be/backend/server');
