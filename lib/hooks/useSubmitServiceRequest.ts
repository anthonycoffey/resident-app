import { useState } from 'react';
import { Alert } from 'react-native';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '@/lib/providers/AuthProvider';
import { PhoenixService } from '@/lib/services/phoenixService';
import { Vehicle } from '@/lib/types/resident';
import { addMinutes } from 'date-fns';

export type ServiceRequestPayload = {
  residentNotes: string;
  serviceDateTime: Date;
  phone: string;
  smsConsent: boolean;
  serviceLocationAddress: object | null;
  selectedPhoenixServices: number[];
  isOffPremiseRequest: boolean;
  selectedVehicle: Vehicle | null;
};

export const useSubmitServiceRequest = (
  phoenixServices: PhoenixService[],
  onSuccess: () => void
) => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  const submitRequest = async (payload: ServiceRequestPayload) => {
    if (!user || !user.organizationId || !user.propertyId) {
      Alert.alert('Error', 'Authentication details are missing.');
      return;
    }
    if (
      payload.selectedPhoenixServices.length === 0 ||
      !payload.serviceLocationAddress ||
      !payload.phone
    ) {
      Alert.alert(
        'Error',
        'Please fill out all required fields: Service Type, Location, and Phone.'
      );
      return;
    }

    setSaving(true);
    try {
      const functions = getFunctions();
      const createServiceRequest = httpsCallable(
        functions,
        'createServiceRequest'
      );

      const serviceTypesForSubmission = payload.selectedPhoenixServices.map(
        (id) => {
          const service = phoenixServices.find((s) => s.id === id);
          return { id: service?.id, value: service?.name };
        }
      );

      const submissionPayload = {
        organizationId: user.organizationId,
        propertyId: user.propertyId,
        residentNotes: payload.residentNotes.trim(),
        serviceDateTime: payload.serviceDateTime.toISOString(),
        phone: payload.phone.trim(),
        smsConsent: payload.smsConsent,
        serviceLocationAddress: payload.serviceLocationAddress,
        serviceTypes: serviceTypesForSubmission,
        isOffPremiseRequest: payload.isOffPremiseRequest,
        car_year: payload.selectedVehicle?.year,
        car_make: payload.selectedVehicle?.make,
        car_model: payload.selectedVehicle?.model,
        car_color: payload.selectedVehicle?.color,
        car_plate: payload.selectedVehicle?.plate,
      };

      await createServiceRequest(submissionPayload);
      Alert.alert('Success', 'Service request submitted successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error submitting service request:', error);
      Alert.alert('Error', 'Failed to submit service request.');
    } finally {
      setSaving(false);
    }
  };

  return { submitRequest, saving };
};
