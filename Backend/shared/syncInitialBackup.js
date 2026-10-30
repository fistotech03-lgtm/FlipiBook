const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const COLLECTIONS_TO_BACKUP = [
  'users',
  'Profiles',
  'flipbooks',
  'customizedsettings',
  'pageEditorSettings',
  'UserFolders',
  'userGallery',
  'leads',
  'loginlogs',
  'counters',
  'flipbookAssets',
  'threedmodels',
  'interactionthreedmodels'
];

async function syncAllToBackup() {
  const primaryUri = process.env.MONGO_URI;
  const backupUri = process.env.BACKUP_MONGO_URI;

  if (!primaryUri || !backupUri) {
    console.error('[Backup Sync] Missing MONGO_URI or BACKUP_MONGO_URI in .env');
    return;
  }

  console.log('[Backup Sync] Connecting to Primary & Backup databases...');
  const primaryConn = await mongoose.createConnection(primaryUri).asPromise();
  const backupConn = await mongoose.createConnection(backupUri).asPromise();

  console.log(`[Backup Sync] Primary: ${primaryConn.name} | Backup: ${backupConn.name}`);

  for (const colName of COLLECTIONS_TO_BACKUP) {
    // 1. Ensure collection exists in backup DB (so it immediately shows in Compass)
    try {
      await backupConn.db.createCollection(colName);
    } catch (_) {}

    // 2. Fetch all existing documents from primary DB
    const primaryCol = primaryConn.db.collection(colName);
    const backupCol = backupConn.db.collection(colName);

    const docs = await primaryCol.find({}).toArray();
    let syncedCount = 0;

    for (const doc of docs) {
      const query = doc._id ? { _id: doc._id } : doc;
      await backupCol.replaceOne(
        query,
        { ...doc, isDeleted: doc.isDeleted !== undefined ? doc.isDeleted : false },
        { upsert: true }
      );
      syncedCount++;
    }

    console.log(`[Backup Sync] Collection "${colName}": ${syncedCount} document(s) synchronized.`);
  }

  await primaryConn.close();
  await backupConn.close();
  console.log('[Backup Sync] Initial sync completed successfully!');
}

if (require.main === module) {
  syncAllToBackup()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Backup Sync] Error:', err);
      process.exit(1);
    });
}

module.exports = syncAllToBackup;

