const express = require('express');
const multer = require('multer');
const path = require('path');
const os = require('os');
const textureController = require('../controllers/textureController');
const textureCategoryController = require('../controllers/textureCategoryController');

const router = express.Router();

const upload = multer({
  dest: path.join(os.tmpdir(), 'texture_uploads'),
  limits: { fileSize: 100 * 1024 * 1024 }
});

const textureUploadFields = [
  { name: 'preview', maxCount: 1 },
  { name: 'base', maxCount: 1 },
  { name: 'metallic', maxCount: 1 },
  { name: 'roughness', maxCount: 1 },
  { name: 'normal', maxCount: 1 },
  { name: 'ao', maxCount: 1 },
  { name: 'displacement', maxCount: 1 },
  { name: 'opacity', maxCount: 1 },
  { name: 'emissive', maxCount: 1 }
];

// Texture Material Routes
router.post('/add', upload.fields(textureUploadFields), textureController.addTexture);
router.post('/upload-chunk', upload.single('chunk'), textureController.uploadTextureChunk);
router.get('/get', textureController.getUserTextures);
router.put('/update/:id', textureController.updateTexture);
router.delete('/delete/:id', textureController.deleteTexture);

// Texture Category Routes
router.get('/categories/get', textureCategoryController.getCategories);
router.post('/categories/add', textureCategoryController.addCategory);
router.put('/categories/rename/:id', textureCategoryController.renameCategory);
router.post('/categories/clear/:id', textureCategoryController.clearTexturesInCategory);
router.delete('/categories/delete/:id', textureCategoryController.deleteCategory);

module.exports = router;
