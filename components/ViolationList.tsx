import React, {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  FlatListProps,
} from 'react-native';
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
import { View, Text } from '@/components/Themed';

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

export interface ViolationListRef {
  refresh: () => void;
}

type ViolationListProps = Omit<FlatListProps<Violation>, 'data' | 'renderItem'>;

const ViolationList = forwardRef<ViolationListRef, ViolationListProps>(
  (props, ref) => {
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
            where('reporterId', '==', user.uid),
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
      fetchViolations();
    }, [user]);

    useImperativeHandle(ref, () => ({
      refresh: () => {
        fetchViolations(true);
      },
    }));

    const onRefresh = () => fetchViolations(true);

    const loadMore = () => {
      if (!loadingMore && lastVisible) {
        fetchViolations();
      }
    };

    const renderItem = ({ item }: { item: Violation }) => (
      <View style={[styles.card, { backgroundColor }]}>
        <Text style={[styles.violationType, { color: textColor }]}>
          {formatViolationType(item.violationType)}
        </Text>
        <View style={styles.detailsContainer}>
          <Text style={{ color: textColor }}>
            {formatStandardTime(item.createdAt)}
          </Text>
          <Chip label={item.status} variant={getStatusVariant(item.status)} />
        </View>
      </View>
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
          <ActivityIndicator size='large' />
        </View>
      );
    }

    return (
      <FlatList
        data={violations}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
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
              marginTop: 24,
            }}
          >
            <Text style={{ color: textColor, fontSize: 18 }}>
              You have not reported any violations.
            </Text>
          </View>
        }
        {...props}
      />
    );
  }
);

export default ViolationList;

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
  },
  violationType: {
    fontWeight: 'bold',
    marginBottom: 5,
    fontSize: 16,
  },
  detailsContainer: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
