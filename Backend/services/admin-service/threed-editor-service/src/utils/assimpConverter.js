const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const ASSIMP_PATH =
  process.env.ASSIMP_PATH || 'C:\\Program Files\\Assimp\\bin\\x64\\assimp.exe';

const isGlbFormat = (filename) => {
  return path.extname(filename).toLowerCase() === '.glb';
};

const is3DFormat = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  return ['.glb', '.gltf', '.obj', '.fbx', '.stl', '.3ds', '.dae', '.ply', '.step', '.stp', '.iges', '.igs'].includes(ext);
};

const convertWithAssimp = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(ASSIMP_PATH)) {
      console.warn(`[Assimp] Executable not found at ${ASSIMP_PATH}. Skipping Assimp conversion.`);
      return resolve(false);
    }

    const args = ['export', inputPath, outputPath, '-u'];
    execFile(ASSIMP_PATH, args, { timeout: 120000 }, (error, stdout, stderr) => {
      if (error) {
        console.error('[Assimp] Conversion error:', error.message, stderr);
        return reject(new Error(`Assimp conversion failed: ${error.message}`));
      }
      if (!fs.existsSync(outputPath)) {
        return reject(new Error('Assimp conversion completed but output file not found'));
      }
      resolve(true);
    });
  });
};

module.exports = {
  isGlbFormat,
  is3DFormat,
  convertWithAssimp
};
