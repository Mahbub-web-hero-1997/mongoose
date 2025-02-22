import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      process.env.MONGODB_CONNECTION_URI
    );
    console.log(
      "Database connection Success",
      connectionInstance.connection.host
    );
  } catch (error) {
    console.error("Error connecting to the database", error);
    process.exit(1);
  }
};

export default connectDB;
