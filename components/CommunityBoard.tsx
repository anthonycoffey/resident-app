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
import CommunityBulletinCard, {
  CommunityBulletin,
} from './ui/CommunityBulletinCard';

const CommunityBoard = () => {
  const { user } = useAuth();
  const [bulletins, setBulletins] = useState<CommunityBulletin[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const primaryColor = useThemeColor({}, 'primary');

  const fetchBulletins = async () => {
    if (!user?.claims?.organizationId) {
      setLoading(false);
      return;
    }

    try {
      const orgId = user.claims.organizationId;
      const bulletinsCollectionPath = `organizations/${orgId}/bulletins`;
      const q = query(
        collection(db, bulletinsCollectionPath),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const fetchedBulletins = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          type: data.type,
          title: data.title,
          message: data.message,
          imageUrl: data.imageUrl,
          licensePlate: data.licensePlate,
          status: data.status,
        } as CommunityBulletin;
      });
      setBulletins(fetchedBulletins);
    } catch (error) {
      console.error('Error fetching community bulletins: ', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBulletins();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBulletins();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {bulletins.length > 0 ? (
        <FlatList
          data={bulletins}
          renderItem={({ item }) => <CommunityBulletinCard bulletin={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={styles.centered}>
          <Text style={styles.noBulletinsText}>
            No community bulletins at this time.
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
    paddingVertical: 10,
  },
});

export default CommunityBoard;
