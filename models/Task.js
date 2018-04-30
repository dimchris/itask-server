var mongoose = require('mongoose');
var Schema = mongoose.Schema;
if (mongoose.connection.readyState === 0) {
  mongoose.connect(require('./connection-string'));
}


var newSchema = new Schema({
  
  'name': { type: String, required: true},
  'description': { type: String, required: true },
  'age': {type: Number,  default: 0},
  'level': {type: Number,  default: 0},
  'image': { type: Schema.Types.ObjectId, ref: 'Image', default: '5ae6ba41f693203ee8018573'},
  'cards': [
    { type: Schema.Types.ObjectId, ref:'Card' }
  ],
  'contributor': { type: Schema.Types.ObjectId, ref: 'User', required: true },
  'published': {type: Number, default: '1'},
  'status': {type:Number, default: '1'},
  'tags': [{type: String}],
  'createdAt': { type: Date, default: Date.now },
  'updatedAt': { type: Date, default: Date.now }
});

newSchema.pre('save', function(next){
  this.updatedAt = Date.now();
  next();
});

newSchema.pre('update', function() {
  this.update({}, { $set: { updatedAt: Date.now() } });
});

newSchema.pre('findOneAndUpdate', function() {
  this.update({}, { $set: { updatedAt: Date.now() } });
});



module.exports = mongoose.model('Task', newSchema);
