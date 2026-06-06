import ActivityLog from '../models/ActivityLog.js';

export const logActivity = async (req, eventType, action, entityType, entityId, metadata = {}) => {
  try {
    await ActivityLog.create({
      eventType,
      action,
      entityType,
      entityId,
      performedBy: req.user ? req.user._id : null,
      metadata
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};
