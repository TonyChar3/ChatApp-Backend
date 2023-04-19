import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        // connect to the mongoDB using the string and mongoose
        const connect = await mongoose.connect(process.env.CONNECTION_STRING);
        console.log("DB connection", connect.connection.host, connect.connection.name)
    } catch(err){
        console.log(err);
        process.exit(1);
    }
}

export default connectDB;