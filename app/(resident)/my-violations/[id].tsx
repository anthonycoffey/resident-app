import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Image,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useThemeColor } from '@/components/Themed';
import {
  getViolationDetails,
  acknowledgeViolation,
} from '@/lib/services/violationService';
import { useAuth } from '@/lib/providers/AuthProvider';

// Based on the documentation provided
interface Violation {
  id: string;
  licensePlate: string;
  violationType: string;
  photoUrl: string;
  reporterId: string;
  residentId: string | null;
  propertyId: string;
  organizationId: string;
  status: 'pending_acknowledgement' | 'acknowledged' | 'escalated_to_manager' | 'reported';
  createdAt: {
    toDate: () => Date;
  };
  acknowledgedAt?: {
    toDate: () => Date;
  };
}

export default function ViolationDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [violation, setViolation] = useState<Violation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acknowledging, setAcknowledging] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardColor = useThemeColor({}, 'card');

  const violationId = Array.isArray(id) ? id[0] : id;

  const fetchViolation = useCallback(async () => {
    if (!violationId || !user?.organizationId) {
      setError('Violation ID or Organization ID is missing.');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const result = (await getViolationDetails(
        violationId,
        user.organizationId
      )) as Violation;
      setViolation({ ...result, id: violationId });
    } catch (err) {
      setError('Failed to fetch violation details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [violationId, user?.organizationId]);

  useEffect(() => {
    fetchViolation();
  }, [fetchViolation]);

  const handleAcknowledge = async () => {
    if (!violation) return;
    setAcknowledging(true);
    try {
      await acknowledgeViolation(violation.id, violation.organizationId);
      setViolation((prev) =>
        prev ? { ...prev, status: 'acknowledged' } : null
      );
    } catch (err) {
      // Optionally show an error message to the user
    } finally {
      setAcknowledging(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <ActivityIndicator size='large' />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Text style={{ color: textColor }}>{error}</Text>
      </View>
    );
  }

  if (!violation) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Text style={{ color: textColor }}>Violation not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor }} contentContainerStyle={styles.scrollContent}>
      <Card style={{ backgroundColor: cardColor, width: '100%' }}>
        <Image source={{ uri: violation.photoUrl }} style={styles.image} />
        <View style={styles.content}>
          <Text style={[styles.title, { color: textColor }]}>
            {violation.violationType}
          </Text>
          <Text style={[styles.label, { color: textColor }]}>License Plate:</Text>
          <Text style={[styles.value, { color: textColor }]}>{violation.licensePlate}</Text>

          <Text style={[styles.label, { color: textColor }]}>Status:</Text>
          <Text style={[styles.value, { color: textColor, textTransform: 'capitalize' }]}>
            {violation.status.replace(/_/g, ' ')}
          </Text>

          <Text style={[styles.label, { color: textColor }]}>Date Reported:</Text>
          <Text style={[styles.value, { color: textColor }]}>
            {violation.createdAt.toDate().toLocaleString()}
          </Text>

          {violation.status === 'pending_acknowledgement' && (
            <Button
              title="I'm Moving It"
              onPress={handleAcknowledge}
              loading={acknowledging}
              disabled={acknowledging}
              style={{ marginTop: 20 }}
            />
          )}
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  image: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  value: {
    fontSize: 16,
    marginTop: 4,
  },
});
