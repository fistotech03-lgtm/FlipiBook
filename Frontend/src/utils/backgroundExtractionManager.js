/**
 * backgroundExtractionManager.js
 * ─────────────────────────────────────────────────────────────
 * Clean facade for document extraction.
 * In the new high-performance architecture, all heavy PDF/PPT extraction
 * is handled server-side in customized-editor-service via Redis queues.
 * Client Web Workers are decommissioned to maintain 60 FPS and <30MB RAM.
 */

class BackgroundExtractionManager {
  constructor() {
    this.activeExtractions = new Map();
  }

  start({ v_id }) {
    console.log(`[BackgroundExtraction] Server-side extraction active for ${v_id}.`);
    this.activeExtractions.set(v_id, Promise.resolve());
  }

  cancel(v_id) {
    this.activeExtractions.delete(v_id);
  }

  isExtracting(v_id) {
    return this.activeExtractions.has(v_id);
  }
}

export const backgroundExtractionManager = new BackgroundExtractionManager();
export default backgroundExtractionManager;
