import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Text, View, useThemeColor } from '@/components/Themed';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { getPhoenixJobDetails, Job } from '@/lib/services/phoenixService';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import JobStatusStepper from './components/JobStatusStepper';
import JobDetailsDisplay from './components/JobDetailsDisplay';
import { db } from '@/lib/config/firebaseConfig';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/lib/providers/AuthProvider';
import ServiceRequestDetailsDisplay from './components/ServiceRequestDetailsDisplay';

interface ServiceRequest {
  id: string;
  requestType: string[];
  serviceLocation: string;
  submittedAt: Timestamp;
  status: string;
}

const JobDetailsScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const primaryColor = useThemeColor({}, 'primary');
  const tintColor = useThemeColor({}, 'tint');
  const errorColor = useThemeColor({}, 'error');
  const successColor = useThemeColor({}, 'success');
  const chipColor = useThemeColor({}, 'chip');
  const textMutedColor = useThemeColor({}, 'textMuted');
  const white = useThemeColor({}, 'white');
  const [job, setJob] = useState<Job | null>(null);
  const [serviceRequest, setServiceRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [eta, setEta] = useState<string>('Calculating...');
  const [distance, setDistance] = useState<string>('Calculating...');

  const fetchJob = useCallback(async () => {
    if (!id) return;
    try {
      const data = await getPhoenixJobDetails(id);
      setJob(data);
      setError(null);
    } catch (err) {
      // Failed to load from Phoenix, try Firestore silently
      try {
        if (!user?.claims?.organizationId) {
          throw new Error('User organization not found');
        }
        const servicesCollectionPath = `organizations/${user.claims.organizationId}/services`;
        const q = query(
          collection(db, servicesCollectionPath),
          where('phoenixSubmissionId', '==', Number(id))
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          setServiceRequest({ id: doc.id, ...doc.data() } as ServiceRequest);
        } else {
          setError('Failed to load job details.');
        }
      } catch (firestoreError) {
        setError('Failed to load job details.');
        console.error(firestoreError);
      }
    }
  }, [id, user]);

  useEffect(() => {
    setLoading(true);
    fetchJob().finally(() => {
      setLoading(false);
    });
  }, [fetchJob]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchJob().finally(() => {
      setRefreshing(false);
    });
  }, [fetchJob]);

  const handleContact = (type: 'sms' | 'tel') => {
    const number = job?.proxy?.ProxyNumber?.number;
    if (number) {
      Linking.openURL(`${type}:${number}`);
    }
  };

  const getCurrentStep = (): number => {
    if (!job) return 0;
    switch (job.status) {
      case 'pending':
        return 1
      case 'assigned':
        return 1
      case 'en-route':
        return 2
      case 'in-progress':
        return 3;
      case 'completed':
        return 4;
      case 'canceled':
        return 4;
      case 'cancelled':
        return 4;
      default:
        return 4; // Or a specific step for canceled
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerTitle: 'Service Request Details',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.push('/service-requests')}
              style={{ paddingHorizontal: 10 }}
            >
              <MaterialIcons name='arrow-back' size={24} color={tintColor} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && !refreshing && <ActivityIndicator size='large' color={primaryColor} />}
        {error && !serviceRequest && (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              padding: 20,
              marginTop: 50,
            }}
          >
            <MaterialIcons
              name='error-outline'
              size={60}
              color={errorColor}
              style={{ marginBottom: 20 }}
            />
            <Text
              style={{
                fontSize: 22,
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: 10,
              }}
            >
              {error}
            </Text>
          </View>
        )}
        {serviceRequest && !job && (
          <View style={{ padding: 10 }}>
            <Card>
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: 20,
                  backgroundColor: 'transparent'
                }}
              >
                <MaterialIcons
                  name='hourglass-empty'
                  size={60}
                  color={textMutedColor}
                  style={{ marginBottom: 20 }}
                />
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    marginBottom: 10,
                  }}
                >
                  Your request is in queue
                </Text>
                <Text style={{ fontSize: 16, textAlign: 'center', color: textMutedColor }}>
                  We are finding a technician nearby. Please contact us if you require
                  additional support.
                </Text>
              </View>
            </Card>
            <Card>
              <ServiceRequestDetailsDisplay serviceRequest={serviceRequest} />
            </Card>
          </View>
        )}
        {job && (
          <>
            <JobStatusStepper currentStep={getCurrentStep()} />
            <Card>
              <MapView
                provider={PROVIDER_GOOGLE}
                style={{
                  width: '100%',
                  height: 300,
                  marginBottom: 16,
                }}
                initialRegion={{
                  latitude: job.Address.lat,
                  longitude: job.Address.lng,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
                pitchEnabled={false}
                rotateEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: job.Address.lat,
                    longitude: job.Address.lng,
                  }}
                  title='Service Location'
                />
                {job.assignedTechnician.latitude &&
                  job.assignedTechnician.longitude && (
                    <Marker
                      coordinate={{
                        latitude: job.assignedTechnician.latitude,
                        longitude: job.assignedTechnician.longitude,
                      }}
                      title='Technician'
                    >
                      {job.assignedTechnician.avatar ? (
                        <Avatar
                          source={{ uri: job.assignedTechnician.avatar }}
                          size={40}
                        />
                      ) : (
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: primaryColor,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <MaterialIcons
                            name='person'
                            size={24}
                            color={white}
                          />
                        </View>
                      )}
                    </Marker>
                  )}
                {job.assignedTechnician.latitude &&
                  job.assignedTechnician.longitude && (
                    <MapViewDirections
                      origin={{
                        latitude: job.Address.lat,
                        longitude: job.Address.lng,
                      }}
                      destination={{
                        latitude: job.assignedTechnician.latitude,
                        longitude: job.assignedTechnician.longitude,
                      }}
                      apikey={process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY!}
                      strokeWidth={5}
                      strokeColor={primaryColor}
                      onReady={(result) => {
                        setDistance(result.distance.toFixed(2) + ' mi');
                        setEta(result.duration.toFixed(0) + ' min');
                      }}
                    />
                  )}
              </MapView>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: textMutedColor,
                  textTransform: 'uppercase',
                }}
              >
                Your Technician
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: 'transparent',
                  marginTop: 8,
                }}
              >
                {job.assignedTechnician.avatar ? (
                  <Avatar
                    source={{ uri: job.assignedTechnician.avatar }}
                    size={56}
                  />
                ) : (
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      backgroundColor: chipColor,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <MaterialIcons name='person' size={36} color={textMutedColor} />
                  </View>
                )}
                <View
                  style={{
                    marginLeft: 15,
                    flex: 1,
                    backgroundColor: 'transparent',
                  }}
                >
                  <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
                    {job.assignedTechnician.fullName}
                  </Text>
                  <Text style={{ color: textMutedColor }}>
                    ETA: {eta} ({distance})
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', backgroundColor: 'transparent' }}>
                  <TouchableOpacity
                    style={{
                      padding: 8,
                      alignItems: 'center',
                    }}
                    onPress={() => handleContact('sms')}
                  >
                    <MaterialIcons
                      name='chat-bubble-outline'
                      size={24}
                      color={primaryColor}
                    />
                    <Text style={{ color: textMutedColor, fontSize: 12 }}>Message</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      padding: 8,
                      alignItems: 'center',
                    }}
                    onPress={() => handleContact('tel')}
                  >
                    <MaterialIcons name='call' size={24} color={primaryColor} />
                    <Text style={{ color: textMutedColor, fontSize: 12 }}>Call</Text>
                  </TouchableOpacity>
                </View>
              </View>
              {job.dispatcher && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'transparent',
                    marginTop: 16,
                    paddingTop: 16,
                    borderTopWidth: 1,
                    borderColor: chipColor,
                  }}
                >
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      backgroundColor: chipColor,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <MaterialIcons name='support-agent' size={36} color={textMutedColor} />
                  </View>
                  <View
                    style={{
                      marginLeft: 15,
                      flex: 1,
                      backgroundColor: 'transparent',
                    }}
                  >
                    <Text style={{ fontSize: 14, color: textMutedColor }}>Dispatcher</Text>
                    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
                      {job.dispatcher.fullName}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', backgroundColor: 'transparent' }}>
                    <TouchableOpacity
                      style={{
                        padding: 8,
                        alignItems: 'center',
                      }}
                      onPress={() => Linking.openURL('sms:+18444072723')}
                    >
                      <MaterialIcons
                        name='chat-bubble-outline'
                        size={24}
                        color={primaryColor}
                      />
                      <Text style={{ color: textMutedColor, fontSize: 12 }}>Message</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        padding: 8,
                        alignItems: 'center',
                      }}
                      onPress={() => Linking.openURL('tel:+18444072723')}
                    >
                      <MaterialIcons name='call' size={24} color={primaryColor} />
                      <Text style={{ color: textMutedColor, fontSize: 12 }}>Call</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </Card>

            <Card>
              <JobDetailsDisplay job={job} />
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default JobDetailsScreen;
