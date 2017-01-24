//模式
var mongoose = require('mongoose');
var MovieSchema = require('../schemas/Movie');
var Movie = mongoose.model('Movie',MovieSchema)

module.exports = Movie