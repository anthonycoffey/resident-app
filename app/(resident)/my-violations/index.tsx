import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useThemeColor } from '@/components/Themed';
import { acknowledgeViolation } from '@/lib/services/violationService';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/config/firebaseConfig';
import { useAuth } from '@/lib/providers/AuthProvider';

// TODO: Replace with the actual violation type definition
interface Violation {
  id: string;
  description: string;
  status: string;
  organizationId: string;
  createdAt: {
    toDate: () => Date;
  };
}

const getMyViolations = httpsCallable(functions, 'getMyViolations');

export default function MyViolationsScreen() {
  const { user } = useAuth();
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [acknowledging, setAcknowledging] = useState<string | null>(null);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const fetchViolations = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const result = await getMyViolations();
      const data = result.data as Violation[];
      setViolations(data);
    } catch (error) {
      console.error('Error fetching violations:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchViolations();
  }, [fetchViolations]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchViolations();
    setRefreshing(false);
  }, [fetchViolations]);

  const handleAcknowledge = async (
    violationId: string,
    organizationId: string
  ) => {
    setAcknowledging(violationId);
    try {
      await acknowledgeViolation(violationId, organizationId);
      // Optimistically update the UI
      setViolations((prev) =>
        prev.map((v) =>
          v.id === violationId ? { ...v, status: 'acknowledged' } : v
        )
      );
    } catch (error) {
      // Handle error (e.g., show a toast message)
    } finally {
      setAcknowledging(null);
    }
  };

  const renderItem = ({ item }: { item: Violation }) => (
    <Card style={{ marginBottom: 16, padding: 16 }}>
      <Text style={{ color: textColor, fontSize: 16, fontWeight: 'bold' }}>
        Violation Reported
      </Text>
      <Text style={{ color: textColor, marginTop: 8 }}>
        {item.description}
      </Text>
      <Text
        style={{
          color: textColor,
          marginTop: 8,
          fontStyle: 'italic',
          textTransform: 'capitalize',
        }}
      >
        Status: {item.status.replace(/_/g, ' ')}
      </Text>
      <Text style={{ color: textColor, marginTop: 8, fontSize: 12 }}>
        Date: {item.createdAt.toDate().toLocaleDateString()}
      </Text>
      {item.status === 'pending_acknowledgement' && (
        <Button
          title="I'm Moving It"
          onPress={() => handleAcknowledge(item.id, item.organizationId)}
          style={{ marginTop: 16 }}
          disabled={acknowledging === item.id}
          loading={acknowledging === item.id}
        />
      )}
    </Card>
  );

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor,
        }}
      >
        <ActivityIndicator size='large' />
      </View>
    );
  }

  return (
    <FlatList
      data={violations}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16 }}
      style={{ backgroundColor }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 50,
          }}
        >
          <Text style={{ color: textColor, fontSize: 18 }}>
            You have no outstanding violations.
          </Text>
        </View>
      }
    />
  );
}
