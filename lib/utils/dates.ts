import { formatDistanceToNow } from 'date-fns';

export const formatDateTime = (dateString: string) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return null;
    }
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return null;
  }
};

export const formatRelativeTime = (dateInput: any) => {
  if (!dateInput) {
    return 'No date';
  }

  try {
    let date;
    if (typeof dateInput === 'string') {
      date = new Date(dateInput);
    } else if (dateInput && typeof dateInput.seconds === 'number') {
      // Handle Firestore Timestamp
      date = new Date(dateInput.seconds * 1000);
    } else if (dateInput && typeof dateInput._seconds === 'number') {
      // Handle serialized Firestore Timestamp
      date = new Date(dateInput._seconds * 1000);
    } else {
      console.warn(
        'Invalid date input passed to formatRelativeTime:',
        dateInput
      );
      return 'Invalid date';
    }

    if (isNaN(date.getTime())) {
      console.warn('Invalid date created from input:', dateInput);
      return 'Invalid date';
    }

    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'Error';
  }
};

export const formatStandardTime = (dateInput: any) => {
  if (!dateInput) {
    return 'No date';
  }

  try {
    let date;
    if (typeof dateInput === 'string') {
      date = new Date(dateInput);
    } else if (dateInput && typeof dateInput.seconds === 'number') {
      // Handle Firestore Timestamp
      date = new Date(dateInput.seconds * 1000);
    } else if (dateInput && typeof dateInput._seconds === 'number') {
      // Handle serialized Firestore Timestamp
      date = new Date(dateInput._seconds * 1000);
    } else {
      console.warn(
        'Invalid date input passed to formatStandardTime:',
        dateInput
      );
      return 'Invalid date';
    }

    if (isNaN(date.getTime())) {
      console.warn('Invalid date created from input:', dateInput);
      return 'Invalid date';
    }

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch (error) {
    console.error('Error formatting standard time:', error);
    return 'Error';
  }
};
