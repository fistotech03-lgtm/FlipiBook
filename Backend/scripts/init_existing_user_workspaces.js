const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../services/auth-service/.env') });

const User = require('../services/auth-service/src/models/User');
const { createUserWorkspace } = require('../services/auth-service/src/utils/workspaceHelper');

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error('MONGO_URI is missing from environment.');
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(async () => {
    console.log('Connected to MongoDB. Fetching users to initialize workspaces...');
    const users = await User.find({});
    console.log(`Found ${users.length} users.`);

    for (const user of users) {
      console.log(`Creating workspace for ${user.emailId} (ID: ${user.userID || 'N/A'}, _id: ${user._id})...`);
      createUserWorkspace(user);
    }

    console.log('Finished initializing workspaces for all users.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Failed to initialize workspaces:', err);
    process.exit(1);
  });
