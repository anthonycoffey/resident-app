import { db } from '@/lib/config/firebaseConfig';
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';

export const acknowledgeViolation = async (
  violationId: string,
  organizationId: string,
  propertyId: string
) => {
  try {
    const violationRef = doc(
      db,
      'organizations',
      organizationId,
      'properties',
      propertyId,
      'violations',
      violationId
    );
    await updateDoc(violationRef, {
      status: 'acknowledged',
      acknowledgedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error acknowledging violation:', error);
    throw new Error('Failed to acknowledge violation.');
  }
};

export const getViolationDetails = async (
  violationId: string,
  organizationId: string,
  propertyId: string
) => {
  try {
    const violationDocRef = doc(
      db,
      'organizations',
      organizationId,
      'properties',
      propertyId,
      'violations',
      violationId
    );
    const violationDocSnap = await getDoc(violationDocRef);

    if (!violationDocSnap.exists()) {
      throw new Error('Violation not found.');
    }

    return violationDocSnap.data();
  } catch (error) {
    console.error('Error getting violation details from Firestore:', error);
    throw new Error('Failed to get violation details.');
  }
};
