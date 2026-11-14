const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { uploadModels, uploadHdris, uploadMaterials } = require('./uploadMiddleware');

// ── Models Endpoints ────────────────────────────────────────────────────────
router.get('/models', controller.listModels);
router.post(
  '/models',
  uploadModels.fields([
    { name: 'modelFile', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  controller.createModel
);
router.put(
  '/models/:id',
  uploadModels.fields([
    { name: 'modelFile', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  controller.updateModel
);
router.delete('/models/:id', controller.deleteModel);

// ── HDRIs Endpoints ─────────────────────────────────────────────────────────
router.get('/hdris', controller.listHdris);
router.post(
  '/hdris',
  uploadHdris.fields([
    { name: 'hdriFile', maxCount: 1 },
    { name: 'preview', maxCount: 1 }
  ]),
  controller.createHdri
);
router.put(
  '/hdris/:id',
  uploadHdris.fields([
    { name: 'hdriFile', maxCount: 1 },
    { name: 'preview', maxCount: 1 }
  ]),
  controller.updateHdri
);
router.delete('/hdris/:id', controller.deleteHdri);

// ── Materials Endpoints ─────────────────────────────────────────────────────
router.get('/materials', controller.listMaterials);
router.post(
  '/materials',
  uploadMaterials.fields([
    { name: 'preview', maxCount: 1 },
    { name: 'map', maxCount: 1 },
    { name: 'normalMap', maxCount: 1 },
    { name: 'roughnessMap', maxCount: 1 },
    { name: 'metalnessMap', maxCount: 1 },
    { name: 'aoMap', maxCount: 1 },
    { name: 'displacementMap', maxCount: 1 }
  ]),
  controller.createMaterial
);
router.put(
  '/materials/:id',
  uploadMaterials.fields([
    { name: 'preview', maxCount: 1 },
    { name: 'map', maxCount: 1 },
    { name: 'normalMap', maxCount: 1 },
    { name: 'roughnessMap', maxCount: 1 },
    { name: 'metalnessMap', maxCount: 1 },
    { name: 'aoMap', maxCount: 1 },
    { name: 'displacementMap', maxCount: 1 }
  ]),
  controller.updateMaterial
);
router.delete('/materials/:id', controller.deleteMaterial);

module.exports = router;

