import mongoose from 'mongoose';

const HyperxInteractionSchema = new mongoose.Schema({
  interactionId: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: String,
    required: true,
    index: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  queryType: {
    type: String,
    enum: ['generic', 'gmailQuery'],
    required: true,
  },
  originalQuery: {
    type: String,
    required: true,
  },
  genericQueryResponse: {
    type: String,
  },
  formattedQuery: {
    type: String,
  },
  gmailData: {
    type: String,
  },

  gmailDataSummary: {
    type: String,
  },
 
  performance: {
    totalProcessingTime: Number,
  },
 
});

HyperxInteractionSchema.index({ timestamp: -1 });
HyperxInteractionSchema.index({ userId: 1, timestamp: -1 });

export const HyperxInteraction = mongoose.models.HyperxInteraction || mongoose.model('Interaction', HyperxInteractionSchema);