const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const fs = require('fs');

// Import controllers and models
const folderController = require('../services/myflipibook-service/src/controllers/folderController');
const bookController = require('../services/myflipibook-service/src/controllers/bookController');
const storageController = require('../services/myflipibook-service/src/controllers/storageController');
const UserFolder = require('../services/myflipibook-service/src/models/UserFolder');
const Flipbook = require('../services/myflipibook-service/src/models/Flipbook');
const UserSettings = require('../services/myflipibook-service/src/models/UserSettings');

// Mock Express req/res
const createMockReqRes = (user, body = {}, query = {}, params = {}) => {
  const req = {
    user,
    body,
    query,
    params,
    cookies: {},
    headers: {}
  };

  let responseData = null;
  let responseStatus = 200;

  const res = {
    status(code) {
      responseStatus = code;
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    },
    send(data) {
      responseData = data;
      return this;
    }
  };

  return {
    req,
    res,
    getResponse: () => ({ status: responseStatus, data: responseData })
  };
};

async function runAudit() {
  console.log('====================================================');
  console.log('🚀 STARTING COMPREHENSIVE AUDIT: MyFlipibook Service');
  console.log('====================================================\n');

  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/flipibook_dev';
  console.log('1. Connecting to MongoDB:', mongoUri);
  await mongoose.connect(mongoUri);
  console.log('✅ MongoDB connected successfully!\n');

  // Test User Identity (Notice: userId is a String like 'FLIPI9999', id is a genuine ObjectId)
  const testObjectId = new mongoose.Types.ObjectId();
  const testUser = {
    id: testObjectId.toString(),
    userId: 'FLIPI9999',
    emailId: 'audit_test_user@flipibook.com'
  };

  console.log('2. Test User Identity:');
  console.log('   - ObjectId (id):', testUser.id);
  console.log('   - Custom UserID (userId):', testUser.userId);
  console.log('   - Email (emailId):', testUser.emailId, '\n');

  // Cleanup any old audit data
  await UserFolder.deleteMany({ $or: [{ userId: testObjectId }, { emailId: testUser.emailId }] });
  await Flipbook.deleteMany({ $or: [{ userId: testObjectId }, { userEmail: testUser.emailId }] });
  await UserSettings.deleteMany({ $or: [{ userId: testObjectId }, { emailId: testUser.emailId }] });

  let testsPassed = 0;
  let totalTests = 0;

  const assertStep = (name, condition, details = '') => {
    totalTests++;
    if (condition) {
      testsPassed++;
      console.log(`  ✅ [PASS] ${name} ${details ? '(' + details + ')' : ''}`);
    } else {
      console.error(`  ❌ [FAIL] ${name} ${details ? '(' + details + ')' : ''}`);
      throw new Error(`Audit failed at step: ${name}`);
    }
  };

  try {
    // TEST 1: GET FOLDERS (Initial empty state -> should return default 'My_Flipbooks')
    console.log('📁 AUDIT: Folder Management Flow');
    {
      const { req, res, getResponse } = createMockReqRes(testUser);
      await folderController.getFolders(req, res);
      const { status, data } = getResponse();
      assertStep('Get initial folders', status === 200 && data.success && Array.isArray(data.folders), `count: ${data.folders?.length}`);
      assertStep('Default folder "My_Flipbooks" present', data.folders.some(f => f.name === 'My_Flipbooks'));
    }

    // TEST 2: CREATE FOLDER (Tests BSON ObjectId bug fix!)
    let createdFolderId = null;
    {
      const { req, res, getResponse } = createMockReqRes(testUser, { folderName: 'Project_Alpha' });
      await folderController.createFolder(req, res);
      const { status, data } = getResponse();
      assertStep('Create folder "Project_Alpha"', status === 201 && data.success && data.id, `folderId: ${data.id}`);
      createdFolderId = data.id;
    }

    // TEST 3: PREVENT DUPLICATE FOLDER NAME
    {
      const { req, res, getResponse } = createMockReqRes(testUser, { folderName: 'Project_Alpha' });
      await folderController.createFolder(req, res);
      const { status, data } = getResponse();
      assertStep('Reject duplicate folder name', status === 400 && !data.success, data.message);
    }

    // TEST 4: RENAME FOLDER
    {
      const { req, res, getResponse } = createMockReqRes(testUser, {
        oldName: 'Project_Alpha',
        newName: 'Project_Beta',
        folderId: createdFolderId
      });
      await folderController.renameFolder(req, res);
      const { status, data } = getResponse();
      assertStep('Rename folder to "Project_Beta"', status === 200 && data.success && data.newName === 'Project_Beta');
    }

    // TEST 5: REORDER FOLDERS
    {
      const reorderedList = [
        { id: createdFolderId, name: 'Project_Beta' },
        { id: new mongoose.Types.ObjectId().toString(), name: 'My_Flipbooks' }
      ];
      const { req, res, getResponse } = createMockReqRes(testUser, { folders: reorderedList });
      await folderController.reorderFolders(req, res);
      const { status, data } = getResponse();
      assertStep('Reorder folders', status === 200 && data.success && data.folders[0].name === 'Project_Beta');
    }

    console.log('\n📖 AUDIT: Flipbook CRUD & Actions Flow');

    // TEST 6: SAVE BOOK (Create initial flipbook)
    let bookVId = null;
    {
      const bookPayload = {
        flipbookName: 'Marketing_Brochure_2026',
        folderName: 'Project_Beta',
        pages: [
          { pageNumber: 1, name: 'Cover', fileName: '1.svg', content: '<svg id="p1"><text>Cover Page Content</text></svg>', size: 1024 },
          { pageNumber: 2, name: 'Intro', fileName: '2.svg', content: '<svg id="p2"><text>Intro Page Content</text></svg>', size: 2048 }
        ],
        fileSize: 3072,
        meta: { orientation: 'landscape', width: 800, height: 600 }
      };
      const { req, res, getResponse } = createMockReqRes(testUser, bookPayload);
      await bookController.saveBook(req, res);
      const { status, data } = getResponse();
      assertStep('Save new flipbook with SVG content', status === 200 && data.success && data.v_id, `v_id: ${data.v_id}`);
      bookVId = data.v_id;
    }

    // TEST 7: PARTIAL SAVE (Save only Page 2 modified, verify Page 1 content is retained)
    {
      const partialPayload = {
        flipbookName: 'Marketing_Brochure_2026',
        v_id: bookVId,
        folderName: 'Project_Beta',
        pages: [
          { pageNumber: 1, name: 'Cover', content: undefined }, // Unchanged
          { pageNumber: 2, name: 'Intro', content: '<svg id="p2"><text>Updated Intro Content</text></svg>' } // Changed
        ]
      };
      const { req, res, getResponse } = createMockReqRes(testUser, partialPayload);
      await bookController.saveBook(req, res);
      const { status, data } = getResponse();
      assertStep('Partial save page without losing existing content', status === 200 && data.success);
    }

    // TEST 8: GET SINGLE BOOK (/api/flipbook/get - verify full content retained)
    {
      const { req, res, getResponse } = createMockReqRes(testUser, {}, { v_id: bookVId });
      await bookController.getBook(req, res);
      const { status, data } = getResponse();
      assertStep('Get single book (/api/flipbook/get)', status === 200 && data.success && data.meta?.v_id === bookVId && Array.isArray(data.pages));
      const p1 = data.pages.find(p => p.pageNumber === 1);
      const p2 = data.pages.find(p => p.pageNumber === 2);
      assertStep('Preserved unchanged Page 1 content', p1?.content?.includes('Cover Page Content'));
      assertStep('Saved updated Page 2 content', p2?.content?.includes('Updated Intro Content'));
    }

    // TEST 8: UPDATE SETTINGS (/api/flipbook/update-settings)
    {
      const { req, res, getResponse } = createMockReqRes(testUser, {
        v_id: bookVId,
        settings: { background: '#f5f5f5' },
        share: { shareId: 'custom-share-123', access: 'public' }
      });
      await bookController.updateSettings(req, res);
      const { status, data } = getResponse();
      assertStep('Update settings (/api/flipbook/update-settings)', status === 200 && data.success && data.settings.share?.shareId === 'custom-share-123');
    }

    // TEST 9: GET BOOKS
    {
      const { req, res, getResponse } = createMockReqRes(testUser);
      await bookController.getBooks(req, res);
      const { status, data } = getResponse();
      assertStep('Get books list', status === 200 && data.success && data.books.length === 1);
      assertStep('Book format matching frontend contract', data.books[0].title === 'Marketing_Brochure_2026' && data.books[0].pagesCount === 2);
    }

    // TEST 8: SAVE PAGES BATCH
    {
      const batchPayload = {
        v_id: bookVId,
        pages: [
          { pageNumber: 3, name: 'Features', fileName: '3.png', size: 1500 },
          { pageNumber: 4, name: 'Contact', fileName: '4.png', size: 1200 }
        ],
        fileSize: 5772
      };
      const { req, res, getResponse } = createMockReqRes(testUser, batchPayload);
      await bookController.savePagesBatch(req, res);
      const { status, data } = getResponse();
      assertStep('Save pages batch (append 2 pages)', status === 200 && data.success);
    }

    // TEST 9: TOGGLE FAVORITE
    {
      const { req, res, getResponse } = createMockReqRes(testUser, { v_id: bookVId, isFavorite: true });
      await bookController.toggleFavorite(req, res);
      const { status, data } = getResponse();
      assertStep('Toggle favorite (true)', status === 200 && data.success && data.isFavorite === true);
    }

    // TEST 10: RENAME BOOK
    {
      const { req, res, getResponse } = createMockReqRes(testUser, {
        v_id: bookVId,
        bookName: 'Marketing_Brochure_2026',
        newBookName: 'Marketing_Brochure_Final'
      });
      await bookController.renameBook(req, res);
      const { status, data } = getResponse();
      assertStep('Rename flipbook title', status === 200 && data.success && data.book.title === 'Marketing_Brochure_Final');
    }

    // TEST 11: DUPLICATE BOOK
    let duplicatedBookVId = null;
    {
      const { req, res, getResponse } = createMockReqRes(testUser, { v_id: bookVId });
      await bookController.duplicateBook(req, res);
      const { status, data } = getResponse();
      assertStep('Duplicate flipbook', status === 201 && data.success && data.book.title.includes('Copy'));
      duplicatedBookVId = data.book.v_id;
    }

    // TEST 12: TRASH BOOK
    {
      const { req, res, getResponse } = createMockReqRes(testUser, { v_id: duplicatedBookVId });
      await bookController.trashBook(req, res);
      const { status, data } = getResponse();
      assertStep('Move book to trash', status === 200 && data.success && data.book.trash === true);
    }

    // TEST 13: RESTORE BOOK
    {
      const { req, res, getResponse } = createMockReqRes(testUser, { v_id: duplicatedBookVId });
      await bookController.restoreBook(req, res);
      const { status, data } = getResponse();
      assertStep('Restore book from trash', status === 200 && data.success && data.book.trash === false);
    }

    // TEST 14: DELETE BOOK PERMANENTLY
    {
      const { req, res, getResponse } = createMockReqRes(testUser, {}, {}, { v_id: duplicatedBookVId });
      await bookController.deleteBookPermanently(req, res);
      const { status, data } = getResponse();
      assertStep('Delete duplicate book permanently', status === 200 && data.success);
    }

    // TEST 15: EMPTY TRASH
    {
      // Trash the original book first to test empty trash
      const { req: trashReq, res: trashRes } = createMockReqRes(testUser, { v_id: bookVId });
      await bookController.trashBook(trashReq, trashRes);

      const { req, res, getResponse } = createMockReqRes(testUser);
      await bookController.emptyTrash(req, res);
      const { status, data } = getResponse();
      assertStep('Empty trash', status === 200 && data.success && data.deletedCount >= 1);
    }

    // TEST 16: DUPLICATE FOLDER
    {
      const { req, res, getResponse } = createMockReqRes(testUser, { folderName: 'Project_Beta' });
      await folderController.duplicateFolder(req, res);
      const { status, data } = getResponse();
      assertStep('Duplicate folder "Project_Beta Copy"', status === 200 && data.success && data.folder === 'Project_Beta Copy');
    }

    // TEST 17: DELETE FOLDER
    {
      const { req, res, getResponse } = createMockReqRes(testUser, { folderName: 'Project_Beta Copy' });
      await folderController.deleteFolder(req, res);
      const { status, data } = getResponse();
      assertStep('Delete folder "Project_Beta Copy"', status === 200 && data.success);
    }

    console.log('\n⚙️ AUDIT: User Storage & Settings Flow');

    // TEST 18: GET STORAGE SETTINGS
    {
      const { req, res, getResponse } = createMockReqRes(testUser);
      await storageController.getStorageSettings(req, res);
      const { status, data } = getResponse();
      assertStep('Get storage settings', status === 200 && data.success && typeof data.usedStorage === 'number' && data.maxStorage > 0);
    }

    // TEST 19: UPDATE AUTOSAVE SETTING
    {
      const { req, res, getResponse } = createMockReqRes(testUser, { isAutoSaveEnabled: false });
      await storageController.updateAutoSave(req, res);
      const { status, data } = getResponse();
      assertStep('Update autosave setting', status === 200 && data.success && data.isAutoSaveEnabled === false);
    }

    // TEST 20: UPDATE EDITOR SETTINGS
    {
      const { req, res, getResponse } = createMockReqRes(testUser, {
        editorSettings: {
          isAutoSaveEnabled: true,
          isTrimViewEnabled: true,
          isRulerEnabled: false
        }
      });
      await storageController.updateEditorSettings(req, res);
      const { status, data } = getResponse();
      assertStep('Update full editor settings', status === 200 && data.success && data.editorSettings.isTrimViewEnabled === true);
    }

    // Clean up test data
    await UserFolder.deleteMany({ $or: [{ userId: testObjectId }, { emailId: testUser.emailId }] });
    await Flipbook.deleteMany({ $or: [{ userId: testObjectId }, { userEmail: testUser.emailId }] });
    await UserSettings.deleteMany({ $or: [{ userId: testObjectId }, { emailId: testUser.emailId }] });

    console.log('\n====================================================');
    console.log(`🎉 AUDIT COMPLETE: ${testsPassed}/${totalTests} TESTS PASSED! (100% SUCCESS)`);
    console.log('====================================================\n');
  } catch (err) {
    console.error('\n❌ AUDIT FAILED WITH ERROR:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

runAudit();
