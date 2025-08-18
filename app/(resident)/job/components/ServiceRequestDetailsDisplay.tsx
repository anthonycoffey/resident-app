import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useThemeColor } from '@/components/Themed';
import Divider from '@/components/ui/Divider';
import Chip from '@/components/ui/Chip';
import { Timestamp } from 'firebase/firestore';

// Define the structure of a service request to be passed as a prop
interface ServiceRequest {
  requestType: string[];
  serviceLocation: string;
  submittedAt: Timestamp;
  status: string;
}

interface ServiceRequestDetailsDisplayProps {
  serviceRequest: ServiceRequest;
}

const formatDateTime = (timestamp: Timestamp | null | undefined) => {
  if (!timestamp) return 'N/A';
  try {
    return new Date(timestamp.seconds * 1000).toLocaleString();
  } catch (e) {
    console.error('Invalid Date', e);
    return 'Invalid Date';
  }
};

const DetailRow = ({ label, value }: { label: string; value: string }) => {
  const textMutedColor = useThemeColor({}, 'textMuted');
  const tintColor = useThemeColor({}, 'tint');
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: textMutedColor }]}>
        {label}
      </Text>
      <Text style={[styles.detailValue, { color: tintColor }]}>{value}</Text>
    </View>
  );
};

const ServiceRequestDetailsDisplay: React.FC<ServiceRequestDetailsDisplayProps> = ({ serviceRequest }) => {
  const tintColor = useThemeColor({}, 'tint');

  return (
    <View>
      <Text style={[styles.title, { color: tintColor }]}>Service Request Details</Text>
      <DetailRow label='Status' value={serviceRequest.status.toUpperCase()} />
      <DetailRow label='Service Location' value={serviceRequest.serviceLocation} />
      <DetailRow label='Submitted At' value={formatDateTime(serviceRequest.submittedAt)} />

      <Divider style={{ marginVertical: 15 }} />

      <Text style={[styles.title, { color: tintColor }]}>Services Requested</Text>
      <View style={styles.chipContainer}>
        {serviceRequest.requestType.map((type, index) => (
          <Chip key={index} label={type.trim()} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detailRow: {
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
});

export default ServiceRequestDetailsDisplay;
