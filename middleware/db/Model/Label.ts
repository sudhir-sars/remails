import mongoose from 'mongoose';

const labelSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  labels: [

    {
      labelId:{type:String,required:true},
      title: { type: String, required: true },
      personalEmails: { type: [String], default: [] },
      domainEmails: { type: [String], default: [] },
      icon:{type:String, required:true},
      fallback:{type:Boolean,default:false}
    },
  ],
});

const Label = mongoose.models.Label || mongoose.model('Label', labelSchema);

export default Label;