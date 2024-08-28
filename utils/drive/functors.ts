export const handleDeleteFromDrive = async (fileIds: string[]): Promise<void> => {
  try {
    const response = await fetch(`/api/drive/deleteFiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem("refreshToken")}`, // Use server environment variable
      },
      body: JSON.stringify({ fileIds }),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(`Failed to delete files. ${result.message}`);
    }
    // Additional server-side logic or notifications
    console.log(`Files deleted successfully. ${new Date().toLocaleString()}`);
  } catch (error) {
    // Type assertion to Error
    if (error instanceof Error) {
      console.error('Error deleting files:', error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    // Optionally, you can send an email notification or log the error
  }
};
