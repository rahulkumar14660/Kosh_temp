import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true }, 
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  target: { type: mongoose.Schema.Types.ObjectId, refPath: 'targetModel' }, 
  targetModel: { type: String }, 
  timestamp: { type: Date, default: Date.now },
  details: { type: Object }, 
});

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
