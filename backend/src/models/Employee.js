const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    department: { type: String, default: '', trim: true },
    position: { type: String, default: '', trim: true },
    profilePictureUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Employee', employeeSchema);
