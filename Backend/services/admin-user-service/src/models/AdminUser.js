const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminUserSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      trim: true,
      uppercase: true,
      unique: true,
      index: true
      // e.g. 'FLIP_AD0001'
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    designation: {
      type: String,
      trim: true,
      default: ''
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true
    },
    password: {
      type: String,
      required: true
    },
    createddate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Active', 'De-Active'],
      default: 'Active'
    },
    // Access: Array [{"Access module name": 0 or 1}]
    Access: {
      type: Array,
      default: () => [
        { "Dashboard": 0 },
        { "3D Editor Assets": 0 },
        { "User Management": 0 },
        { "Template Management": 0 },
        { "Management - Role Access": 0 },
        { "Management - User": 0 }
      ]
    }
  },
  {
    versionKey: false
  }
);

// Pre-save hook: auto-generate userId (starting from FLIP_AD0001)
adminUserSchema.pre('save', async function () {
  // Auto-generate userId if not present
  if (!this.userId) {
    try {
      const staffCount = await this.constructor.countDocuments({ userId: /^FLIP_AD/i });
      this.userId = `FLIP_AD${String(staffCount + 1).padStart(4, '0')}`;
    } catch (err) {
      this.userId = `FLIP_AD${Date.now().toString().slice(-4)}`;
    }
  }

  // Ensure default password is set if empty
  if (!this.password) {
    this.password = 'Admin@123';
  }
});

// Helper instance method to compare passwords (supports plain-text and legacy bcrypt hashes)
adminUserSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password || !candidatePassword) return false;
  if (this.password === candidatePassword) return true;
  if (typeof this.password === 'string' && this.password.startsWith('$2b$')) {
    return bcrypt.compare(candidatePassword, this.password);
  }
  return false;
};

module.exports = mongoose.models.AdminUser || mongoose.model('AdminUser', adminUserSchema);
