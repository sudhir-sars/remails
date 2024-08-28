
import mongoose from 'mongoose';

const suggestableSchema = new mongoose.Schema({
  
  email: {
    type: { type: [String], default: [] },

  },



});

const Suggestable = mongoose.models.Suggestable || mongoose.model('suggestableSchema', suggestableSchema);

export default Suggestable;
