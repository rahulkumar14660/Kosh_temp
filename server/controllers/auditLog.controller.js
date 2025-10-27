import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { AuditLog } from "../models/auditLog.model.js";
export const getAuditLogs = catchAsyncErrors(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
    } = req.query;

    const logs = await AuditLog.find()
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('performedBy', 'name email')
      .populate('target')
      .exec();
    res.json({ logs });
  } catch (err) {
    console.error('Failed to fetch audit logs:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});