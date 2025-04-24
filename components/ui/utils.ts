export const formatDate = (dateString: string) => {
  try {
    if (!dateString) return 'No date available';
    
    // First, try to parse the date
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    
    // Format date to YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Date parsing error:", error);
    return 'Invalid date';
  }
};
