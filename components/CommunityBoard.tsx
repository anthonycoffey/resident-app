import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { View, Text, useThemeColor } from '@/components/Themed';
import { db } from '@/lib/config/firebaseConfig';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useAuth } from '@/lib/providers/AuthProvider';
import NotificationCard from './ui/NotificationCard';
import { Notification } from '@/lib/types/notification';

const CommunityBoard = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const primaryColor = useThemeColor({}, 'primary');

  const fetchNotifications = async () => {
    if (!user?.organizationId || !user?.propertyId) {
      setLoading(false);
      return;
    }

    try {
      const { organizationId, propertyId } = user;
      const notificationsCollectionPath = `organizations/${organizationId}/properties/${propertyId}/notifications`;
      const q = query(
        collection(db, notificationsCollectionPath),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const fetchedNotifications = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
        } as Notification;
      });
      setNotifications(fetchedNotifications);
    } catch (error) {
      // Temporarily suppress Firebase permissions errors if 'bulletins' collection doesn't exist.
      // This allows the community board to render without bulletins instead of showing an error.
      // TODO: Re-enable error logging once the bulletins feature is fully implemented.
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size='large' color={primaryColor} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          renderItem={({ item }) => <NotificationCard notification={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={styles.centered}>
          <Text style={styles.noBulletinsText}>
            No community notifications at this time.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noBulletinsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 8,
  },
});

export default CommunityBoard;
