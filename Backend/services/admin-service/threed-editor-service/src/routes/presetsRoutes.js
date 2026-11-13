const express = require('express');
const presetsController = require('../controllers/presetsController');

const router = express.Router();

router.get('/hdri', presetsController.getHdriPresets);
router.get('/materials', presetsController.getMaterialPresets);
router.get('/models', presetsController.getPresetModels);
router.get('/models/:id', presetsController.getPresetModelById);
router.post('/models', presetsController.addPresetModel);
router.put('/models/:id', presetsController.updatePresetModel);
router.delete('/models/:id', presetsController.deletePresetModel);

module.exports = router;
