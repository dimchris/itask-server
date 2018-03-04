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
    // validate: [validator.isEmail, 'Email is invalid'] 
  },
  'fullname':{
    type: String, 
    required: 'Fullname is required'
  },
  'password': { 
    type: String,
    trim:true,
    required:'Password is required',
    // validate: [
    //   {
    //     validator: !validator.isEmpty,
    //     msg: 'Password Empty'
    //   },
    //   {
    //     validator: (pass) => {return pass.length>=8},
    //     msg: 'Password too short'
    //   }
    // ]

   },
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
