import { NextResponse, NextRequest } from 'next/server';
import connectDb from "@/middleware/db/mongoose";
import Label from "@/middleware/db/Model/Label";
// Save a new label
export const POST = connectDb(async (req: NextRequest) => {
  
  try {
    const { userId, label } = await req.json();
    console.log(userId)
    // Find existing labels for the user
    const existingLabels = await Label.findOne({ userId });

    if (existingLabels) {
      // If labels already exist, update the existing document
      existingLabels.labels.push(label);
      await existingLabels.save();

      return NextResponse.json({ success: true, data: existingLabels }, { status: 200 });
    } else {
      // If no labels exist, create a new label document
      const newLabel = new Label({ userId, labels: [label] });
      await newLabel.save();

      return NextResponse.json({ success: true, data: newLabel }, { status: 201 });
    }
  } catch (error) {
    console.error("Error adding label:", error);
    return NextResponse.json({ success: false, error: "Failed to add label" }, { status: 500 });
  }
});


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

// Update a label
export const PATCH = connectDb(async (req: NextRequest) => {
  try {
    const { userId, labelId, updatedLabel } = await req.json();
    console.log(userId)
    console.log(labelId)
    console.log(updatedLabel)
    if(!updatedLabel){
      return NextResponse.json({success:false,error:"The label cannot be empty!!"},{status:200})
    }
    const updatedLabelDoc = await Label.findOneAndUpdate(
      { userId, 'labels._id': labelId },
      { $set: { 'labels.$': updatedLabel } },
     
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

// Delete a label
// Delete a label
export const DELETE = connectDb(async (req: NextRequest) => {
  try {
    const { userId, labelId } = await req.json();

    // Find the document by userId
    const userLabels = await Label.findOne({ userId });

    if (!userLabels) {
      // If userLabels is not found, return 404 with appropriate error message
      return NextResponse.json({ success: false, error: "Label not found" }, { status: 404 });
    }

    console.log(userLabels)
    // Filter out the label with the specified _id
    userLabels.labels = userLabels.labels.filter(label => label._id != labelId);

    // Save the updated document
    await userLabels.save();

    // Log the updated userLabels document (optional)
    console.log(userLabels);

    // Return success response with updated data
    return NextResponse.json({ success: true, data: userLabels });
  } catch (error) {
    // Handle any errors that occur during deletion
    console.error("Error deleting label:", error);
    return NextResponse.json({ success: false, error: "Failed to delete label" }, { status: 500 });
  }
});
