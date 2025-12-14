/**
 * Account management utilities
 */

/**
 * Delete the current user's personal data
 * This performs a partial deletion of user data (anonymizes the account)
 * rather than a full account deletion
 */
export async function deleteUserData() {
  try {
    const response = await fetch('/api/user/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete user data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting user data:', error);
    throw error;
  }
}
