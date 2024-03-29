var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var validator = require('validator')
if (mongoose.connection.readyState === 0) {
  mongoose.connect(require('./connection-string'));
}


var newSchema = new Schema({
  'email': {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    required: 'Email address is required',
    validate: [validator.isEmail, 'Email is invalid']
  },
  'fullname': {
    type: String,
    required: 'Fullname is required'
  },
  'password': {
    type: String,
    trim: true,
    required: 'Password is required',
  },
  'role': {
    type: String,
    default: 'user'
  },
  'status': {
    type: Number,
    default: '0'
  },
  cards: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Card'
    }
  ],
  images:[
    {
      type: Schema.Types.ObjectId,
      ref:'Image'
    }
  ],
  tasks:[
    {
      type: Schema.Types.ObjectId,
      ref: 'Task'
    }
  ]
  ,
  'createdAt': { type: Date, default: Date.now },
  'updatedAt': { type: Date, default: Date.now }
});

newSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

newSchema.pre('update', function () {
  this.update({}, { $set: { updatedAt: Date.now() } });
});

newSchema.pre('findOneAndUpdate', function () {
  this.update({}, { $set: { updatedAt: Date.now() } });
});



module.exports = mongoose.model('User', newSchema);
