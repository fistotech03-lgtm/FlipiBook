const TextureCategory = require('../models/textureCategory');
const Texture = require('../models/texture');

/**
 * GET /api/textures/categories/get
 */
const getCategories = async (req, res) => {
  try {
    const email = req.query.email || req.query.userEmail || req.query.emailId;
    if (!email) return res.status(400).json({ message: 'User email required' });

    const cleanEmail = email.trim().toLowerCase();
    const categories = await TextureCategory.find({
      $or: [{ userEmail: cleanEmail }, { emailId: cleanEmail }, { userEmail: email }, { emailId: email }]
    }).sort({ name: 1 });

    res.status(200).json({ success: true, count: categories.length, categories });
  } catch (error) {
    console.error('[Category] Error fetching categories:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * POST /api/textures/categories/add
 */
const addCategory = async (req, res) => {
  try {
    const name = (req.body.name || '').trim();
    const userEmail = req.body.userEmail || req.body.email || req.body.emailId;
    if (!name || !userEmail) {
      return res.status(400).json({ message: 'Name and User Email required' });
    }

    const category = await TextureCategory.findOneAndUpdate(
      { userEmail, name },
      { userEmail, name },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ success: true, category });
  } catch (error) {
    console.error('[Category] Error adding category:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * PUT /api/textures/categories/rename/:id
 */
const renameCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const name = (req.body.name || '').trim();
    if (!name) return res.status(400).json({ message: 'New name required' });

    const category = await TextureCategory.findByIdAndUpdate(id, { name }, { new: true });
    if (!category) return res.status(404).json({ message: 'Category not found' });

    res.status(200).json({ success: true, category });
  } catch (error) {
    console.error('[Category] Error renaming category:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * POST /api/textures/categories/clear/:id
 */
const clearTexturesInCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await TextureCategory.findById(id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    await Texture.deleteMany({ materialCategory: id });

    res.status(200).json({ success: true, message: 'All textures in category cleared' });
  } catch (error) {
    console.error('[Category] Error clearing textures:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * DELETE /api/textures/categories/delete/:id
 */
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await TextureCategory.findById(id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    await Texture.deleteMany({ materialCategory: id });
    await TextureCategory.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: 'Category and its textures deleted' });
  } catch (error) {
    console.error('[Category] Error deleting category:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getCategories,
  addCategory,
  renameCategory,
  clearTexturesInCategory,
  deleteCategory
};
