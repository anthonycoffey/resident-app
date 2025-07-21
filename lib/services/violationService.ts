import { functions } from '@/lib/config/firebaseConfig';
import { httpsCallable } from 'firebase/functions';

const acknowledgeViolationFunction = httpsCallable(
  functions,
  'acknowledgeViolation'
);

export const acknowledgeViolation = async (
  violationId: string,
  organizationId: string
) => {
  try {
    const result = await acknowledgeViolationFunction({
      violationId,
      organizationId,
    });
    return result.data;
  } catch (error) {
    console.error('Error acknowledging violation:', error);
    throw new Error('Failed to acknowledge violation.');
  }
};

const getViolationDetailsFunction = httpsCallable(
  functions,
  'getViolationDetails'
);

export const getViolationDetails = async (
  violationId: string,
  organizationId: string
) => {
  try {
    const result = await getViolationDetailsFunction({
      violationId,
      organizationId,
    });
    return result.data;
  } catch (error) {
    console.error('Error getting violation details:', error);
    throw new Error('Failed to get violation details.');
  }
};
