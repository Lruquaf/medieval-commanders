const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');

function detectProvider(databaseUrl) {
  if (!databaseUrl) return 'postgresql';
  const lower = databaseUrl.toLowerCase();
  if (lower.startsWith('postgres') || lower.startsWith('postgresql')) return 'postgresql';
  if (lower.startsWith('file:') || lower.includes('sqlite')) return 'sqlite';
  if (lower.startsWith('mysql')) return 'mysql';
  return 'postgresql';
}

function loadDatabaseUrlFromDotenv() {
  try {
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/^DATABASE_URL\s*=\s*(.+)$/m);
      if (match && match[1]) {
        let val = match[1].trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        return val;
      }
    }
  } catch (_) {}
  return '';
}

try {
  const dbUrl = process.env.DATABASE_URL || loadDatabaseUrlFromDotenv() || '';
  const provider = detectProvider(dbUrl);

  let schema = fs.readFileSync(schemaPath, 'utf8');
  // Replace provider line inside datasource db block
  schema = schema.replace(/datasource\s+db\s*\{[\s\S]*?provider\s*=\s*"[^"]+"/, (match) => {
    return match.replace(/provider\s*=\s*"[^"]+"/, `provider = "${provider}"`);
  });

  fs.writeFileSync(schemaPath, schema, 'utf8');
  console.log(`✓ Prisma provider synced to: ${provider}${dbUrl ? ` (from ${dbUrl})` : ''}`);
} catch (e) {
  console.error('Failed to sync Prisma provider:', e.message);
  process.exit(0); // don't break npm script
}

