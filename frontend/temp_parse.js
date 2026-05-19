const fs = require('fs');
const parser = require('@babel/parser');
const code = fs.readFileSync('src/components/Dashboard.js', 'utf8');
try {
  parser.parse(code, { sourceType: 'module', plugins: ['jsx'] });
  console.log('PARSE_OK');
} catch (e) {
  console.error(e.message);
  console.error('line', e.loc.line, 'column', e.loc.column);
  const lines = code.split(/\r?\n/);
  for (let i = Math.max(0, e.loc.line - 3); i < Math.min(lines.length, e.loc.line + 2); i++) {
    console.error(`${i+1}: ${lines[i]}`);
  }
  process.exit(1);
}
