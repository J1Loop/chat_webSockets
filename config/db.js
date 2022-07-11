const mongoose = require('mongoose');


mongoose.connect(process.env.MONGO_URL);

// mongodb+srv://jorge_admin:jorge123@chat-database.sv3reaj.mongodb.net/?retryWrites=true&w=majority