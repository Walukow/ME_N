const mongoose = require('mongoose');
const dbName = 'coba'
mongoose.connect(`mongodb://127.0.0.1:27017/${dbName}`);