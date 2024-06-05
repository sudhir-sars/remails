// models/ListItem.js
const mongoose = require("mongoose");

const listItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    color: { type: String, default: 'bg-red-500' },
    status: { type: String, enum: ['to do', 'in progress', 'completed'], default: 'to do' },
    
    
  },
  { timestamps: true }
);

const ListItem = mongoose.models.ListItem || mongoose.model('ListItem', listItemSchema);

export default ListItem;