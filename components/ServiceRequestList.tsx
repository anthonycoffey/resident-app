import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { View, Text } from '@/components/Themed';
import { useThemeColor } from '@/components/Themed';
import { db } from '@/lib/config/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '@/lib/providers/AuthProvider';
import { Timestamp } from 'firebase/firestore';
import Card from './ui/Card';
import { MaterialIcons } from '@expo/vector-icons';

type ServiceStatus = 'Completed' | 'In Progress' | 'Pending' | 'submitted';

type ServiceRequest = {
  id: string;
  requestType: string;
  status: ServiceStatus;
  submittedAt: Timestamp;
  phoenixSubmissionId?: string;
  serviceLocation?: string;
};

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

const Chip = ({ label }: { label: string }) => {
  const chipColor = useThemeColor(
    { light: '#E5E5EA', dark: '#3A3A3C' },
    'tabIconDefault'
  );
  const textColor = useThemeColor({}, 'text');
  return (
    <View style={[styles.chip, { backgroundColor: chipColor }]}>
      <Text style={[styles.chipText, { color: textColor }]}>{label}</Text>
    </View>
  );
};

const ServiceRequestItem = ({ item }: { item: ServiceRequest }) => {
  const color = useThemeColor({}, 'text');
  const statusColor = getStatusColor(item.status);

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
  };

  const handlePress = () => {
    if (item.phoenixSubmissionId) {
      console.log('View Job:', item.phoenixSubmissionId);
    }
  };

  return (
    <Card>
      <TouchableOpacity
        onPress={handlePress}
        disabled={!item.phoenixSubmissionId}
      >
        <View style={styles.itemHeader}>
          <Text style={[styles.itemDate, { color }]}>
            {formatDate(item.submittedAt)}
          </Text>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
        <View
          style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}
        >
          <View style={{ marginRight: 6 }}>
            {/* Map Pin Icon */}
            <MaterialIcons name='location-pin' size={18} color={color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.itemTitle, { color }]}>
              {item.serviceLocation || 'No location specified'}
            </Text>
          </View>
        </View>
        <View style={styles.chipContainer}>
          {item.requestType.split(',').map((type, index) => (
            <Chip key={index} label={type.trim()} />
          ))}
        </View>
      </TouchableOpacity>
    </Card>
  );
};

const ServiceRequestList = () => {
  const { user } = useAuth();
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const rowsPerPage = 5;

  useEffect(() => {
    const fetchServiceRequests = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const orgId = user.claims?.organizationId;
        if (!orgId) {
          throw new Error('User does not have an organizationId claim.');
        }
        const servicesCollectionPath = `organizations/${orgId}/services`;
        const q = query(
          collection(db, servicesCollectionPath),
          where('residentId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        const requests = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            requestType: data.requestType,
            status: data.status,
            submittedAt: data.submittedAt,
            phoenixSubmissionId: data.phoenixSubmissionId,
            serviceLocation: data.serviceLocation,
          } as ServiceRequest;
        });
        setServiceRequests(requests);
      } catch (error) {
        console.error('Error fetching service requests: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceRequests();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size='large' />
      </View>
    );
  }

  const totalPages = Math.ceil(serviceRequests.length / rowsPerPage);
  const paginatedRequests = serviceRequests.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  );

  return (
    <View style={styles.container}>
      {serviceRequests.length > 0 ? (
        <>
          <FlatList
            data={paginatedRequests}
            renderItem={({ item }) => <ServiceRequestItem item={item} />}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ flexGrow: 1 }}
          />
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              onPress={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              style={styles.paginationButton}
            >
              <MaterialIcons
                name='keyboard-arrow-left'
                size={24}
                color={page === 0 ? '#ccc' : '#007AFF'}
              />
            </TouchableOpacity>
            <Text style={styles.pageNumberText}>
              Page {page + 1} of {totalPages}
            </Text>
            <TouchableOpacity
              onPress={() =>
                setPage((p) =>
                  (p + 1) * rowsPerPage < serviceRequests.length ? p + 1 : p
                )
              }
              disabled={(page + 1) * rowsPerPage >= serviceRequests.length}
              style={styles.paginationButton}
            >
              <MaterialIcons
                name='keyboard-arrow-right'
                size={24}
                color={
                  (page + 1) * rowsPerPage >= serviceRequests.length
                    ? '#ccc'
                    : '#007AFF'
                }
              />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <Text style={styles.noRequestsText}>
          You have no recent service requests.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
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
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'medium',
  },
  itemDate: {
    fontSize: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  chip: {
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 5,
    marginBottom: 5,
  },
  chipText: {
    fontSize: 12,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 1,
  },
  paginationButton: {
    padding: 4,
  },
  pageNumberText: {
    marginHorizontal: 15,
    fontSize: 16,
    color: '#888',
  },
});

export default ServiceRequestList;
