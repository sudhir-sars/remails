import { IUserLabels } from "../types";
interface ILabelData {
  userId: string;
  label: IUserLabels;
}
export async function userLabelDelete(labelId: string) {
  try {
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
      throw new Error('User ID is not found in local storage');
    }

    const labelBody = {
      userId: userId!,
      labelId: labelId
    };

    const response = await fetch(`/api/userData/labels`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(labelBody),
    });

    if (!response.ok) {
      throw new Error('Failed to delete label');
    }

    const data = await response.json();
    console.log('Label deleted successfully:', data);
  } catch (err) {
    console.error('Error deleting label:', err);
    // Handle error appropriately
  }
}


export async function userLabelEdit(label: IUserLabels) {
  console.log(label);

  try {
    const userId = localStorage.getItem('userId');

    if (!userId) {
      throw new Error('User ID is not found in local storage');
    }

    const labelBody = {
      userId: userId!,
      label: label,
    };

    const response = await fetch(`/api/userData/labels`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(labelBody),
    });

    if (!response.ok) {
      throw new Error('Failed to update label');
    }

    const data = await response.json();
    console.log('Label updated successfully:', data);
  } catch (err) {
    console.error('Error updating label:', err);
    // Handle error appropriately
  }
}



// Function to save a new label
export async function userLabelSave(labelData: IUserLabels, userId: string) {
  try {
    const labelBody:ILabelData = {
      userId,
      label: labelData,
    };

    const response = await fetch(`/api/userData/labels`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(labelBody),
    });

    if (!response.ok) {
      throw new Error('Failed to add label');
    }

    const data = await response.json();
    console.log('Label added successfully:', data);
    return data;
  } catch (err) {
    console.error('Error adding label:', err);
    throw err;  // Re-throw the error to handle it in the calling function
  }
}
