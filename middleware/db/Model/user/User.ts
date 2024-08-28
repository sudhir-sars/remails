import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  gender: {
    type: String,
    default:'M',
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  isOnBoardingNotDone:{
    type: Boolean,
    required:true,
    default:true
  },
  userAddressLastFetchTime:{
    type: String,
    default:null

  },
  
  avatarId:{
    type: String,
    default: '1'
  },
  givenName: {
    type: String,
    trim: true
  },
  familyName: {
    type: String,
    trim: true
  },
  picture: {
    type: String,
    trim: true
  },

  historyId: {
    type: String,
    default: ''
  },

  refreshToken: {
    type: String,
    trim: true,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
