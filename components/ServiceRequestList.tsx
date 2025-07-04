import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { View, Text } from '@/components/Themed';
import { useThemeColor } from '@/components/Themed';
import { db } from '@/lib/config/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '@/lib/providers/AuthProvider';
import { Timestamp } from 'firebase/firestore';

type ServiceStatus = 'Completed' | 'In Progress' | 'Pending' | 'submitted';

type ServiceRequest = {
  id: string;
  requestType: string;
  status: ServiceStatus;
  submittedAt: Timestamp;
};

const ServiceRequestItem = ({ item }: { item: ServiceRequest }) => {
  const color = useThemeColor({}, 'text');
  const cardBackgroundColor = useThemeColor({}, 'background');

  const getStatusColor = (status: ServiceStatus) => {
    switch (status) {
      case 'Completed':
        return '#4CAF50'; // Green
      case 'In Progress':
        return '#FFC107'; // Amber
      case 'Pending':
        return '#F44336'; // Red
      case 'submitted':
        return '#2196F3'; // Blue
      default:
        return '#9E9E9E'; // Grey
    }
  };

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
  };

  return (
    <View style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
      <View style={styles.itemHeader}>
        <Text style={[styles.itemTitle, { color }]}>{item.requestType}</Text>
        <Text style={[styles.itemDate, { color }]}>{formatDate(item.submittedAt)}</Text>
      </View>
      <View style={styles.statusContainer}>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(item.status) }]} />
        <Text style={[styles.itemStatus, { color: getStatusColor(item.status) }]}>{item.status}</Text>
      </View>
    </View>
  );
};

const ServiceRequestList = () => {
  const { user } = useAuth();
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServiceRequests = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const orgId = user.claims?.organizationId;
        if (!orgId) {
          throw new Error("User does not have an organizationId claim.");
        }
        const servicesCollectionPath = `organizations/${orgId}/services`;
        const q = query(collection(db, servicesCollectionPath), where('residentId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const requests = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            requestType: data.requestType,
            status: data.status,
            submittedAt: data.submittedAt,
          } as ServiceRequest;
        });
        setServiceRequests(requests);
      } catch (error) {
        console.error("Error fetching service requests: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceRequests();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Service Requests</Text>
      {serviceRequests.length > 0 ? (
        <FlatList
          data={serviceRequests}
          renderItem={({ item }) => <ServiceRequestItem item={item} />}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      ) : (
        <Text style={styles.noRequestsText}>You have no recent service requests.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  noRequestsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  card: {
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemDate: {
    fontSize: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  itemStatus: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ServiceRequestList;
