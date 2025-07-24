import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useAuth } from '@/lib/providers/AuthProvider';
import Card from '@/components/ui/Card';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useThemeColor } from '@/components/Themed';
import Chip from '@/components/ui/Chip';
import { formatStandardTime } from '@/lib/utils/dates';
import { Violation } from '@/lib/types/violation';

const formatViolationType = (type: string) => {
  if (!type) return '';
  return type
    .replace(/_/g, ' ')
    .replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
};

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

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'acknowledged':
        return 'success';
      case 'escalated':
        return 'error';
      case 'reported':
        return 'primary';
      default:
        return 'primary';
    }
  };

  const renderItem = ({ item }: { item: Violation }) => (
    <Card style={styles.card}>
      <Text style={[styles.violationType, { color: themeColors.text }]}>
        {formatViolationType(item.violationType)}
      </Text>
      <View style={styles.detailsContainer}>
        <Text style={{ color: themeColors.text }}>
          {formatStandardTime(item.createdAt)}
        </Text>
        <Chip label={item.status} variant={getStatusVariant(item.status)} />
      </View>
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

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    padding: 15,
    borderRadius: 10,
  },
  violationType: {
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 16,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default MyViolationsScreen;
