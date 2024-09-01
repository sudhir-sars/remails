import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

const connectDb = (handler: (req: NextRequest) => Promise<NextResponse>) => async (req: NextRequest) => {
  if (mongoose.connections[0].readyState) {
    console.log("already connection exist using exixting conn")
    return handler(req);
  }
  

  const dbUri = process.env.NEXT_PUBLIC_MONGO_URL;
  if (!dbUri) {
    throw new Error("MONGO_URI environment variable is not defined");
  }
  console.log("no connection exists trying to connect")
  // Connect to MongoDB with the specified database name
  await mongoose.connect(dbUri, { dbName: 'remails' });
  console.log("connedt to db")
  return handler(req);
};

export default connectDb;