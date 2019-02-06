// prettier doesn't support "extends" so we have to load it manually
const fs = require('fs');

module.exports = JSON.parse(fs.readFileSync('./config/.prettierrc', 'utf8'));
