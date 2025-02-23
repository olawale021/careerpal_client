export const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error("Date parsing error:", error);
    return 'Invalid date';
  }
};
