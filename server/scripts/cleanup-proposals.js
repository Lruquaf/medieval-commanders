/*
  Maintenance utility:
  - Normalizes legacy NULL emails in proposals by setting them to '' (empty string)
  - Optionally deletes a single proposal by id if --delete-id <id> is provided

  Usage:
    node server/scripts/cleanup-proposals.js                 # normalize emails only
    node server/scripts/cleanup-proposals.js --delete-id XXX  # also delete proposal XXX
*/

const path = require('path');
try { require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') }); } catch (_) {}

const prisma = require('../lib/prisma');

async function normalizeNullEmails() {
  // Use raw SQL to avoid Prisma mapping issues on nullable fields
  // Works for both SQLite and Postgres with simple UPDATE
  const provider = (process.env.DATABASE_URL || '').startsWith('postgres') ? 'postgresql' : 'sqlite';
  if (provider === 'postgresql') {
    await prisma.$executeRawUnsafe('UPDATE "proposals" SET "email" = \'\' WHERE "email" IS NULL');
  } else {
    await prisma.$executeRawUnsafe('UPDATE `proposals` SET `email` = \"\" WHERE `email` IS NULL');
  }
}

async function deleteProposalById(id) {
  if (!id) return;
  // Raw delete to avoid selection of columns
  const provider = (process.env.DATABASE_URL || '').startsWith('postgres') ? 'postgresql' : 'sqlite';
  if (provider === 'postgresql') {
    await prisma.$executeRawUnsafe('DELETE FROM "proposals" WHERE "id" = $1', id);
  } else {
    await prisma.$executeRawUnsafe('DELETE FROM `proposals` WHERE `id` = ?', id);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const deleteIdFlagIndex = args.indexOf('--delete-id');
  const deleteId = deleteIdFlagIndex >= 0 ? args[deleteIdFlagIndex + 1] : undefined;

  console.log('Normalizing legacy NULL emails in proposals...');
  await normalizeNullEmails();
  console.log('Email normalization complete.');

  if (deleteId) {
    console.log(`Deleting proposal with id: ${deleteId}`);
    await deleteProposalById(deleteId);
    console.log('Deletion complete.');
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error('Cleanup failed:', err);
    await prisma.$disconnect();
    process.exit(1);
  });


