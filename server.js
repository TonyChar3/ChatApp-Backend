import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/dbConnection.js';
import errorHandler from './middleware/errorHandler.js';
import userRoutes from './routes/userRoutes.js';
import contactRoutes from './routes/contactRoutes.js';

dotenv.config();
connectDB();
const app = express();
const port = process.env.PORT || 5002;
app.use(express.json());

app.use("/contacts", contactRoutes);
app.use("/user", userRoutes);
app.use(errorHandler);


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});