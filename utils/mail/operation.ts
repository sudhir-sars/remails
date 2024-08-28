  // Define the possible operations
  type EmailOperation =
    | 'delete'
    | 'archive'
    | 'createLabel'
    | 'deleteLabel'
    | 'addToLabel'
    | 'removeFromLabel'
    | 'markAsRead'
    | 'checkLabel'
    | 'modifyLabel';

  // Define the parameters for the function
  interface EmailOperationParams {
    operation: EmailOperation;
    messageIds?: string[];
    label?: string;
  }

  // Define the response structure
  interface ApiResponse {
    success: boolean;
    message?: string;
    error?: string;
    response?: any;
  }


export async function handleEmailOperation({
  operation,
  messageIds,
  label,
}: EmailOperationParams): Promise<ApiResponse> {
  try {
    // Get the JWT token from wherever you're storing it (e.g., localStorage)
    const token = localStorage.getItem('refreshToken');

    if (!token) {
      throw new Error('No authentication token found');
    }

    // Prepare the request body
    const requestBody: EmailOperationParams = { operation };

    // Add messageIds and label to the request body if they're provided
    if (messageIds) requestBody.messageIds = messageIds;
    if (label) requestBody.label = label;

    // Make the API request using Fetch
    const response = await fetch('/api/gmail/utils', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    // Check if the response is ok (status code 200-299)
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP error! Status: ${response.status}, Message: ${errorText}`
      );
    }

    // Parse the JSON response
    const data: ApiResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error performing email operation:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}

export async function deleteMessages(messageIds: string[]) {
  const result = await handleEmailOperation({
    operation: 'delete',
    messageIds,
  });
  return result
  console.log(result);
}

// Archive messages
export async function archiveMessages(messageIds: string[]) {
  
  const result = await handleEmailOperation({
    operation: 'archive',
    messageIds,
  });
  return result
  console.log(result);
}

// Create a new label
export async function createLabel(labelName: string) {
  const result = await handleEmailOperation({
    operation: 'createLabel',
    label: labelName,
  });
  return result
  
  console.log(result);
  return result

}

// // check exixtence for label
// export async function checkLabel(labelName: string) {
//   const result = await handleEmailOperation({
//     operation: 'checkLabel',
//     label: labelName,
//   });
//   console.log(result);
// }

// // check exixtence for label
// export async function modifyLabel(labelName: string) {
//   const result = await handleEmailOperation({
//     operation: 'modifyLabel',
//     label: labelName,
//   });
//   console.log(result);
// }


// Delete a label
export async function deleteLabel(labelId: string) {
  const result = await handleEmailOperation({
    operation: 'deleteLabel',
    label: labelId,
  });
  return result
  console.log(result);
}

// Add messages to a label
export async function addToLabel(messageIds: string[], labelId: string) {
  const result = await handleEmailOperation({
    operation: 'addToLabel',
    messageIds,
    label: labelId,
  });
  return result
  console.log(result);
}

// Remove messages from a label
export async function removeFromLabel(messageIds: string[], labelId: string) {
  const result = await handleEmailOperation({
    operation: 'removeFromLabel',
    messageIds,
    label: labelId,
  });
  return result
  console.log(result);
}

// Mark messages as read
export async function markAsRead(messageIds: string[]) {
  const result = await handleEmailOperation({
    operation: 'markAsRead',
    messageIds,
  });
  return result
  
}
