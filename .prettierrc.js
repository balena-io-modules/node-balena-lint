// prettier doesn't support "extends" so we have to load it manually
import fs from 'fs';

export default JSON.parse(fs.readFileSync('./config/.prettierrc', 'utf8'));
