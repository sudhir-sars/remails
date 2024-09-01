
import mongoose from 'mongoose';

const InteractionSubSchema = new mongoose.Schema({
  interactionTime: { type: String, required: true },
  originalQuery: { type: String, required: true },
  classification:{type:String,required:true},
  genericQueryResponse: { type: String },
  formattedGmailApiQuery: { type: String },
  gmailDataSummary: { type: String },
  gmailQueryResponse:{ type: String },
});

const HyperxUserPastInteractionDataSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  lastInteractedTime: { type: Date, default: Date.now },
  PastInteractionData: { type: [InteractionSubSchema], required: true },
});

export const HyperxUserPastInteractionData = mongoose.models.HyperxUserPastInteractionData || mongoose.model('HyperxUserPastInteractionData', HyperxUserPastInteractionDataSchema);