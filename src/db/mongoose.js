const mongoose = require('mongoose');

const MongoDB = process.env.MONGODB_URL

mongoose.connect(MongoDB,{
    useNewUrlParser: true, 
    useUnifiedTopology: true
});
