import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { View, Text, useThemeColor } from '@/components/Themed';
import { db } from '@/lib/config/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '@/lib/providers/AuthProvider';
import { Timestamp } from 'firebase/firestore';
import Card from '@/components/ui/Card';
import Chip from '@/components/ui/Chip';
import Divider from '@/components/ui/Divider';
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

const getStatusColorName = (status: ServiceStatus) => {
  switch (status) {
    case 'Completed':
      return 'success' as const;
    case 'In Progress':
      return 'warning' as const;
    case 'Pending':
      return 'error' as const;
    case 'submitted':
      return 'primary' as const;
    default:
      return 'secondary' as const;
  }
};

const ServiceRequestItem = ({ item }: { item: ServiceRequest }) => {
  const router = useRouter();
  const color = useThemeColor({}, 'text');
  const statusColor = useThemeColor({}, getStatusColorName(item.status));

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
  };

  const handlePress = () => {
    if (item.phoenixSubmissionId) {
      router.push({
        pathname: '/(resident)/job/[id]',
        params: { id: item.phoenixSubmissionId },
      });
    }
  };

  return (
    <Card>
      <TouchableOpacity
        onPress={handlePress}
        disabled={!item.phoenixSubmissionId}
        style={{ backgroundColor: 'transparent' }}
      >
        <View style={[styles.itemHeader, { backgroundColor: 'transparent' }]}>
          <Text style={[styles.itemDate, { color }]}>
            {formatDate(item.submittedAt)}
          </Text>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 10,
            backgroundColor: 'transparent',
          }}
        >
          <View style={{ marginRight: 6, backgroundColor: 'transparent' }}>
            {/* Map Pin Icon */}
            <MaterialIcons name='location-pin' size={18} color={color} />
          </View>
          <View style={{ flex: 1, backgroundColor: 'transparent' }}>
            <Text style={[styles.itemTitle, { color }]}>
              {item.serviceLocation || 'No location specified'}
            </Text>
          </View>
        </View>
        <View
          style={[styles.chipContainer, { backgroundColor: 'transparent' }]}
        >
          {item.requestType.split(',').map((type, index) => (
            <Chip key={index} label={type.trim()} />
          ))}
        </View>
      </TouchableOpacity>
    </Card>
  );
};

const ServiceRequestsScreen = () => {
  const { user } = useAuth();
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const primaryColor = useThemeColor({}, 'primary');
  const labelColor = useThemeColor({}, 'label');
  const disabledColor = useThemeColor({}, 'divider');
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
        <ActivityIndicator size='large' color={primaryColor} />
      </View>
    );
  }

  const totalPages = Math.ceil(serviceRequests.length / rowsPerPage);
  const paginatedRequests = serviceRequests.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  );

  return (
    <SafeAreaView style={styles.container}>
      {serviceRequests.length > 0 ? (
        <>
          <FlatList
            data={paginatedRequests}
            renderItem={({ item }) => <ServiceRequestItem item={item} />}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ flexGrow: 1 }}
            ListFooterComponent={
              <View
                style={[
                  styles.paginationContainer,
                  { backgroundColor: 'transparent' },
                ]}
              >
                <Divider />
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'transparent',
                  }}
                >
                  <TouchableOpacity
                    onPress={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    style={styles.paginationButton}
                  >
                    <MaterialIcons
                      name='keyboard-arrow-left'
                      size={24}
                      color={page === 0 ? disabledColor : primaryColor}
                    />
                  </TouchableOpacity>
                  <Text style={[styles.pageNumberText, { color: labelColor }]}>
                    Page {page + 1} of {totalPages}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      setPage((p) =>
                        (p + 1) * rowsPerPage < serviceRequests.length
                          ? p + 1
                          : p
                      )
                    }
                    disabled={
                      (page + 1) * rowsPerPage >= serviceRequests.length
                    }
                    style={styles.paginationButton}
                  >
                    <MaterialIcons
                      name='keyboard-arrow-right'
                      size={24}
                      color={
                        (page + 1) * rowsPerPage >= serviceRequests.length
                          ? disabledColor
                          : primaryColor
                      }
                    />
                  </TouchableOpacity>
                </View>
              </View>
            }
          />
        </>
      ) : (
        <Text style={styles.noRequestsText}>
          You have no recent service requests.
        </Text>
      )}
    </SafeAreaView>
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
    fontWeight: '500',
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
  paginationContainer: {
    alignItems: 'center',
  },
  paginationButton: {
    padding: 4,
  },
  pageNumberText: {
    marginHorizontal: 15,
    fontSize: 16,
  },
});

export default ServiceRequestsScreen;
