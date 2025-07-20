import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuth } from '@/lib/providers/AuthProvider';
import Card from '@/components/ui/Card';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useThemeColor } from '@/components/Themed';

interface Violation {
  id: string;
  violationType: string;
  status: string;
  createdAt: {
    seconds: number;
  };
}

const MyViolationsScreen = () => {
  const { user } = useAuth();
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const rowsPerPage = 10;

  const themeColors = {
    text: useThemeColor({}, 'text'),
    background: useThemeColor({}, 'background'),
    card: useThemeColor({}, 'card'),
  };

  const functions = getFunctions();
  const getMyViolations = httpsCallable(functions, 'getMyViolations');

  const fetchViolations = async (currentPage = 0) => {
    if (!user || !user.propertyId) return;
    setLoading(true);
    try {
      const result = await getMyViolations({
        organizationId: user.organizationId,
        propertyId: user.propertyId,
        page: currentPage,
        rowsPerPage,
      });
      const data = result.data as { violations: any[]; total: number };
      setViolations(
        currentPage === 0
          ? data.violations
          : [...violations, ...data.violations]
      );
      setTotal(data.total);
      setPage(currentPage);
    } catch (error) {
      console.error('Error fetching violations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchViolations(0);
  }, [user]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchViolations(0);
  }, [user]);

  const loadMore = () => {
    if (violations.length < total) {
      fetchViolations(page + 1);
    }
  };

  const renderItem = ({ item }: { item: Violation }) => (
    <Card style={{ marginBottom: 10, padding: 15 }}>
      <Text style={{ color: themeColors.text, fontWeight: 'bold' }}>
        {item.violationType}
      </Text>
      <Text style={{ color: themeColors.text }}>Status: {item.status}</Text>
      <Text style={{ color: themeColors.text }}>
        Date: {new Date(item.createdAt.seconds * 1000).toLocaleDateString()}
      </Text>
    </Card>
  );

  return (
    <View style={{ flex: 1, backgroundColor: themeColors.background }}>
      <FlatList
        data={violations}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 10 }}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading && !refreshing ? <ActivityIndicator /> : null
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          !loading ? (
            <Text
              style={{
                textAlign: 'center',
                color: themeColors.text,
                marginTop: 20,
              }}
            >
              No violations found.
            </Text>
          ) : null
        }
      />
    </View>
  );
};

export default MyViolationsScreen;
