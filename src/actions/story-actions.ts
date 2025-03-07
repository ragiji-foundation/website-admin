'use server';

export async function deleteSuccessStory(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/success-stories/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete success story');
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting success story:', error);
    return { success: false };
  }
}
