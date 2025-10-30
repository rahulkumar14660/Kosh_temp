import { AuditLog } from "../models/auditLog.model.js";

export const logAction = async ({ action, performedBy, target, targetModel, details }) => {
  try {
    await AuditLog.create({ action, performedBy, target, targetModel, details });
  } catch (err) {
    console.error('Audit log error:', err);
  }
};
