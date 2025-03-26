const { connectToDatabase } = require('./models/db');

connectToDatabase().then(() => {
    console.log("MongoDB connected successfully!");
}).catch((e) => {
    console.error("MongoDB connection failed:", e);
});
