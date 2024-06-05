import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

const connectDb = (handler: (req: NextRequest) => Promise<NextResponse>) => async (req: NextRequest) => {
  if (mongoose.connections[0].readyState) {
    return handler(req);
  }

  const dbUri = process.env.NEXT_PUBLIC_MONGO_URL;
  if (!dbUri) {
    throw new Error("MONGO_URI environment variable is not defined");
  }

  await mongoose.connect(dbUri);
  return handler(req);
};

export default connectDb;