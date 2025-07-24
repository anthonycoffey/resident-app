import React, { useState, useEffect, useCallback } from 'react';
import { ActivityIndicator, ScrollView, Image, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useThemeColor, View, Text } from '@/components/Themed';
import {
  getViolationDetails,
  acknowledgeViolation,
} from '@/lib/services/violationService';
import { useAuth } from '@/lib/providers/AuthProvider';
import { formatRelativeTime, formatStandardTime } from '@/lib/utils/dates';
import { Violation } from '@/lib/types/violation';
import Chip from '@/components/ui/Chip';

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
    if (!violationId || !user?.organizationId || !user?.propertyId) {
      setError('Required information is missing to fetch violation details.');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const result = (await getViolationDetails(
        violationId,
        user.organizationId,
        user.propertyId
      )) as Violation;
      setViolation({ ...result, id: violationId });
    } catch (err) {
      setError('Failed to fetch violation details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [violationId, user?.organizationId, user?.propertyId]);

  useEffect(() => {
    fetchViolation();
  }, [fetchViolation]);

  const handleAcknowledge = async () => {
    if (!violation) return;
    setAcknowledging(true);
    try {
      await acknowledgeViolation(
        violation.id,
        violation.organizationId,
        violation.propertyId
      );
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
    <ScrollView>
      <Card>
        <Image source={{ uri: violation.photoUrl }} style={styles.image} />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 8,
            backgroundColor: 'transparent',
          }}
        >
          <Text style={[styles.title, { color: textColor, marginRight: 8 }]}>
            {violation.violationType.replace(/_/g, ' ')}
          </Text>
          <Chip label={violation.status.replace(/_/g, ' ')} />
        </View>
        <Text style={[styles.label, { color: textColor }]}>License Plate:</Text>
        <Text style={[styles.value, { color: textColor }]}>
          {violation.licensePlate}
        </Text>

        <Text style={[styles.label, { color: textColor }]}>Reported:</Text>
        <Text style={[styles.value, { color: textColor }]}>
          {formatStandardTime(violation.createdAt)}
        </Text>
        <Text
          style={[
            styles.value,
            { color: textColor, fontSize: 14, marginTop: 2 },
          ]}
        >
          ({formatRelativeTime(violation.createdAt)})
        </Text>

        {violation.status === 'pending' && (
          <Button
            title="I'm Moving It!"
            onPress={handleAcknowledge}
            loading={acknowledging}
            disabled={acknowledging}
            style={{ marginTop: 20 }}
          />
        )}
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
    marginBottom: 8,
    height: 250,
    resizeMode: 'cover',
  },
  title: {
    textTransform: 'capitalize',
    fontSize: 18,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  value: {
    fontSize: 16,
  },
});
