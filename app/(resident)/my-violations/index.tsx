import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import Card from '@/components/ui/Card';
import { useThemeColor } from '@/components/Themed';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from '@/lib/config/firebaseConfig';
import { useAuth } from '@/lib/providers/AuthProvider';
import { Violation } from '@/lib/types/violation';
import Chip from '@/components/ui/Chip';
import { formatStandardTime } from '@/lib/utils/dates';

const formatViolationType = (type: string) => {
  if (!type) return '';
  return type
    .replace(/_/g, ' ')
    .replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
};

const getStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'reported':
      return 'primary';
    case 'claimed':
      return 'secondary';
    case 'acknowledged':
      return 'success';
    case 'resolved':
      return 'success';
    case 'pending_tow':
      return 'warning';
    case 'towed':
      return 'error';
    default:
      return 'primary';
  }
};

export default function MyViolationsScreen() {
  const { user } = useAuth();
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastVisible, setLastVisible] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const fetchViolations = useCallback(
    async (isRefresh = false) => {
      if (!user || !user.claims?.organizationId || !user.claims?.propertyId) {
        console.error('User data is incomplete to fetch violations.');
        setLoading(false);
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
        setLastVisible(null); // Reset for refresh
      } else if (!lastVisible) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const organizationId = user.claims.organizationId as string;
        const propertyId = user.claims.propertyId as string;
        const violationsCollectionRef = collection(
          db,
          'organizations',
          organizationId,
          'properties',
          propertyId,
          'violations'
        );

        let q = query(
          violationsCollectionRef,
          where('residentId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(10)
        );

        if (lastVisible && !isRefresh) {
          q = query(q, startAfter(lastVisible));
        }

        const querySnapshot = await getDocs(q);
        const newViolations = querySnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as Violation)
        );

        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        if (isRefresh) {
          setViolations(newViolations);
        } else {
          setViolations((prev) =>
            lastVisible ? [...prev, ...newViolations] : newViolations
          );
        }
      } catch (error) {
        console.error('Error fetching violations:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [user, lastVisible]
  );

  useEffect(() => {
    if (user) {
      fetchViolations();
    }
  }, [user]);


  const onRefresh = () => fetchViolations(true);

  const loadMore = () => {
    if (!loadingMore && lastVisible) {
      fetchViolations();
    }
  };

  const renderItem = ({ item }: { item: Violation }) => (
    <TouchableOpacity
      onPress={() => router.push(`/my-violations/${item.id}`)}
    >
      <Card style={styles.card}>
        <Text style={[styles.violationType, { color: textColor }]}>
          {formatViolationType(item.violationType)}
        </Text>
        <View style={styles.detailsContainer}>
          <Text style={{ color: textColor }}>
            {formatStandardTime(item.createdAt)}
          </Text>
          <Chip label={item.status} variant={getStatusVariant(item.status)} />
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor,
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      <FlatList
        data={violations}
        renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 10 }}
      style={{ backgroundColor }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={loadingMore ? <ActivityIndicator /> : null}
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
    </SafeAreaView>
  );
}

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
