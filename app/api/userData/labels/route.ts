import { NextResponse, NextRequest } from 'next/server';
import connectDb from "@/middleware/db/mongoose";
import Label from "@/middleware/db/Model/Label";

interface LabelType {
  labelId: string;
  title: string;
  personalEmails: string[];
  domainEmails: string[];
  icon: string;
  fallback: boolean;
}


export const GET = connectDb(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    console.log(userId)

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 });
    }

    const labels = await Label.findOne({ userId });

    if (!labels) {
      return NextResponse.json({ success: false, error: `No labels found for this user ${userId}` }, { status: 200 });
    }

    return NextResponse.json({ success: true, data: labels });
  } catch (error) {
    console.error("Error fetching labels:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch labels" }, { status: 500 });
  }
});




// Save a new label
export const POST = connectDb(async (req: NextRequest) => {
  try {
    const { userId, label }: { userId: string; label: LabelType } = await req.json();

    if (!label.labelId) {
      return NextResponse.json({ success: false, error: "Label ID is required" }, { status: 400 });
    }

    const existingLabels = await Label.findOne({ userId });

    if (existingLabels) {
      const existingLabel = existingLabels.labels.find((l: LabelType) => l.labelId === label.labelId);
      if (existingLabel) {
        return NextResponse.json({ success: false, error: "Label with this ID already exists" }, { status: 400 });
      }

      existingLabels.labels.push(label);
      await existingLabels.save();

      return NextResponse.json({ success: true, data: existingLabels }, { status: 200 });
    } else {
      const newLabel = new Label({ userId, labels: [label] });
      await newLabel.save();

      return NextResponse.json({ success: true, data: newLabel }, { status: 201 });
    }
  } catch (error) {
    console.error("Error adding label:", error);
    return NextResponse.json({ success: false, error: "Failed to add label" }, { status: 500 });
  }
});


export const PATCH = connectDb(async (req: NextRequest) => {
  try {
    const { userId, label }: { userId: string; label: LabelType } = await req.json();

    if (!label || !label.labelId) {
      return NextResponse.json({ success: false, error: "Label and Label ID are required" }, { status: 400 });
    }

    const updatedLabelDoc = await Label.findOneAndUpdate(
      { userId, 'labels.labelId': label.labelId },
      { $set: { 'labels.$': label } },
      { new: true }
    );

    if (!updatedLabelDoc) {
      return NextResponse.json({ success: false, error: "Label not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedLabelDoc });
  } catch (error) {
    console.error("Error updating label:", error);
    return NextResponse.json({ success: false, error: "Failed to update label" }, { status: 500 });
  }
});



export const DELETE = connectDb(async (req: NextRequest) => {
  try {
    const { userId, labelId }: { userId: string; labelId: string } = await req.json();

    if (!labelId) {
      return NextResponse.json({ success: false, error: "Label ID is required" }, { status: 400 });
    }

    const userLabels = await Label.findOne({ userId });

    if (!userLabels) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    userLabels.labels = userLabels.labels.filter((label: LabelType) => label.labelId !== labelId);

    await userLabels.save();

    return NextResponse.json({ success: true, data: userLabels });
  } catch (error) {
    console.error("Error deleting label:", error);
    return NextResponse.json({ success: false, error: "Failed to delete label" }, { status: 500 });
  }
});
