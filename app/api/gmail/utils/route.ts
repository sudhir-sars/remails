import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import jwt from 'jsonwebtoken';

const oAuth2Client = new google.auth.OAuth2(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
  process.env.NEXT_PUBLIC_REDIRECT_URI
);

interface DecodedToken {
  refreshToken: string;
}

interface EmailOperation {
  operation: 'delete' | 'archive' | 'createLabel' | 'deleteLabel' | 'addToLabel' | 'removeFromLabel' | 'markAsRead'|'checkLabel';
  messageIds?: string[];
  label?: string;
  newLabelName?:string
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.NEXT_PUBLIC_JWT_SECRET!) as DecodedToken;
    oAuth2Client.setCredentials({ refresh_token: decoded.refreshToken });
    const { credentials } = await oAuth2Client.refreshAccessToken();
    oAuth2Client.setCredentials(credentials);

    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    const body: EmailOperation = await req.json();
    const { operation, messageIds, label,newLabelName } = body;

    if (!operation) {
      return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
    }

    let response;
    let labels;
    console.log("from utils: "+operation)

    switch (operation) {
      
      case 'delete':
        if (!messageIds || messageIds.length === 0) {
          return NextResponse.json({ success: false, error: 'MessageIds are required for delete operation' }, { status: 400 });
        }
        response = await Promise.all(
          messageIds.map(id => gmail.users.messages.trash({ userId: 'me', id }))
        );
        break;

      case 'archive':
        if (!messageIds || messageIds.length === 0) {
          return NextResponse.json({ success: false, error: 'MessageIds are required for archive operation' }, { status: 400 });
        }
        response = await Promise.all(
          messageIds.map(id =>
            gmail.users.messages.modify({
              userId: 'me',
              id,
              requestBody: { removeLabelIds: ['INBOX'] }
            })
          )
        );
        break;

      case 'createLabel':
        if (!label) {
          return NextResponse.json({ success: false, error: 'Label name is required for createLabel operation' }, { status: 400 });
        }
        response = await gmail.users.labels.create({
          userId: 'me',
          requestBody: {
            name: label,
            labelListVisibility: 'labelShow',
            messageListVisibility: 'show'
          }
        });
       
        break;

      // case 'deleteLabel':
      //   if (!label) {
      //     return NextResponse.json({ success: false, error: 'Label ID is required for deleteLabel operation' }, { status: 400 });
      //   }
      //   response = await gmail.users.labels.delete({
      //     userId: 'me',
      //     id: label
      //   });
      //   break;

      case 'addToLabel':
        if (!label || !messageIds || messageIds.length === 0) {
          return NextResponse.json({ success: false, error: 'Label and messageIds are required for addToLabel operation' }, { status: 400 });
        }
        response = await Promise.all(
          messageIds.map(id =>
            gmail.users.messages.modify({
              userId: 'me',
              id,
              requestBody: { addLabelIds: [label] }
            })
          )
        );
        break;

      case 'removeFromLabel':
        if (!label || !messageIds || messageIds.length === 0) {
          return NextResponse.json({ success: false, error: 'Label and messageIds are required for removeFromLabel operation' }, { status: 400 });
        }
        response = await Promise.all(
          messageIds.map(id =>
            gmail.users.messages.modify({
              userId: 'me',
              id,
              requestBody: { removeLabelIds: [label] }
            })
          )
        );
        break;

      case 'markAsRead':
        if (!messageIds || messageIds.length === 0) {
          return NextResponse.json({ success: false, error: 'MessageIds are required for markAsRead operation' }, { status: 400 });
        }
        const batchModifyRequest = {
          ids: messageIds,
          removeLabelIds: ['UNREAD']
        };
    
        response =await gmail.users.messages.batchModify({
          userId: 'me',
          requestBody: batchModifyRequest
        });

        // response = await Promise.all(
        //   messageIds.map(id =>
        //     gmail.users.messages.modify({
        //       userId: 'me',
        //       id,
        //       requestBody: { removeLabelIds: ['UNREAD'] }
        //     })
        //   )
        // );
        break;

      case 'checkLabel':
        if (!label) {
          return NextResponse.json({ success: false, error: 'Label name is required for checkLabel operation' }, { status: 400 });
        }
        // Fetch the list of labels
        response = await gmail.users.labels.list({ userId: 'me' });
        labels = response.data.labels || [];
        // Check if the label exists
        const labelExists = labels.some(existingLabel => existingLabel.name === label);
        response = { exists: 'labelExists' };
        break;

        // case 'renameLabel':
        //   if (!label || !body.newLabelName) {
        //     return NextResponse.json({ success: false, error: 'Label name and newLabelName are required for renameLabel operation' }, { status: 400 });
        //   }
        
        //   const { newLabelName } = body;
        
        //   // Fetch all labels
        //   response = await gmail.users.labels.list({ userId: 'me' });
        //   labels = response.data.labels || [];
          
        //   // Find the label to rename
        //   const labelToRename = labels.find(existingLabel => existingLabel.name === label);
          
        //   if (!labelToRename) {
        //     return NextResponse.json({ success: false, error: 'Label not found' }, { status: 404 });
        //   }
        
        //   // Create new label with the new name
        //   const newLabelResponse = await gmail.users.labels.create({
        //     userId: 'me',
        //     requestBody: {
        //       name: newLabelName,
        //       labelListVisibility: 'labelShow',
        //       messageListVisibility: 'show'
        //     }
        //   });
        
        //   // Get ID of the newly created label
        //   const newLabelId = newLabelResponse.data.id;
        
        //   // Add the new label to all messages that had the old label
        //   const messagesResponse = await gmail.users.messages.list({ userId: 'me', q: `label:${label}` });
        //   const messages = messagesResponse.data.messages || [];
          
        //   await Promise.all(
        //     messages.map(message =>
        //       gmail.users.messages.modify({
          
        //         userId: 'me',
        //         id: message.id!,
        //         requestBody: { addLabelIds: [newLabelId!], removeLabelIds: [labelToRename.id!] }
        //       })
        //     )
        //   );
        
        //   // Delete the old label
        //   await gmail.users.labels.delete({
        //     userId: 'me',
        //     id: labelToRename.id!
        //   });
        
        //   response = { success: true, message: 'Label renamed successfully' };
        //   break;
        

      default:
        return NextResponse.json({ success: false, error: 'Invalid operation' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: `${operation} operation completed successfully`, response });

  } catch (error) {
    console.error('Error performing email operation:', error);
    return NextResponse.json({ success: false, error: 'Failed to perform email operation' }, { status: 500 });
  }
}