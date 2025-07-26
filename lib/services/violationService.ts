import { db } from '@/lib/config/firebaseConfig';
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

export const claimViolation = async (
  violationId: string,
  residentId: string,
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
      residentId: residentId,
      status: 'claimed',
      claimedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error claiming violation:', error);
    throw new Error('Failed to claim violation.');
  }
};

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

export const getViolationByLicensePlate = async (
  licensePlate: string,
  organizationId: string,
  propertyId: string
) => {
  try {
    const violationsRef = collection(
      db,
      'organizations',
      organizationId,
      'properties',
      propertyId,
      'violations'
    );
    const q = query(violationsRef, where('licensePlate', '==', licensePlate));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    // Assuming one violation per license plate for this context
    const violationDoc = querySnapshot.docs[0];
    return { id: violationDoc.id, ...violationDoc.data() };
  } catch (error) {
    console.error('Error getting violation by license plate:', error);
    throw new Error('Failed to get violation by license plate.');
  }
};
