import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { getPhoenixJobDetails, Job } from '@/lib/services/phoenixService';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';

const JobDetailsScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      getPhoenixJobDetails(id)
        .then((data) => {
          setJob(data);
          setLoading(false);
        })
        .catch((err) => {
          setError('Failed to load job details.');
          setLoading(false);
          console.error(err);
        });
    }
  }, [id]);

  const handleContact = (type: 'sms' | 'tel') => {
    const number = job?.proxy?.ProxyNumber?.number;
    if (number) {
      Linking.openURL(`${type}:${number}`);
    }
  };

  return (
    <SafeAreaView>
      <Stack.Screen
        options={{
          headerTitle: 'Service Request Details',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.push('/service-requests')}
              style={{ paddingHorizontal: 10 }}
            >
              <MaterialIcons name='arrow-back' size={24} color='black' />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView>
        {loading && <ActivityIndicator size='large' color='#0000ff' />}
        {error && (
          <Text style={{ color: 'red', textAlign: 'center', marginTop: 20 }}>
            {error}
          </Text>
        )}
        {job && (
          <>
            <Card>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  marginBottom: 10,
                  backgroundColor: 'transparent',
                }}
              >
                Technician Information
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: 'transparent',
                }}
              >
                {job.assignedTechnician.avatar ? (
                  <Avatar
                    source={{ uri: job.assignedTechnician.avatar }}
                    size={60}
                  />
                ) : (
                  <View
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      backgroundColor: '#e0e0e0',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <MaterialIcons name='person' size={36} color='#757575' />
                  </View>
                )}
                <View
                  style={{
                    marginLeft: 15,
                    flex: 1,
                    backgroundColor: 'transparent',
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: '600' }}>
                    {job.assignedTechnician.fullName}
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      marginTop: 8,
                      backgroundColor: 'transparent',
                    }}
                  >
                    <TouchableOpacity
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginRight: 15,
                      }}
                      onPress={() => handleContact('sms')}
                    >
                      <MaterialIcons
                        name='chat-bubble-outline'
                        size={24}
                        color='#007AFF'
                      />
                      <Text
                        style={{
                          marginLeft: 5,
                          color: '#007AFF',
                          fontSize: 14,
                        }}
                      >
                        Message
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginRight: 15,
                      }}
                      onPress={() => handleContact('tel')}
                    >
                      <MaterialIcons name='call' size={24} color='#007AFF' />
                      <Text
                        style={{
                          marginLeft: 5,
                          color: '#007AFF',
                          fontSize: 14,
                        }}
                      >
                        Call
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Card>

            <Card>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
                Service Location
              </Text>
              <Text>{job.Address.fullAddress}</Text>

              <MapView
                provider={
                  Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined
                }
                style={{
                  width: '100%',
                  height: 400,
                }}
                initialRegion={{
                  latitude: job.Address.lat,
                  longitude: job.Address.lng,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
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
                      pinColor='blue'
                    />
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
                      strokeWidth={3}
                      strokeColor='hotpink'
                    />
                  )}
              </MapView>
            </Card>

            <Card>
              <Text
                style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}
              >
                Job Status
              </Text>
              <Text
                style={{ fontSize: 16, fontWeight: 'bold', color: '#4CAF50' }}
              >
                {job.status.replace('_', ' ').toUpperCase()}
              </Text>
            </Card>

            <Card>
              <Text
                style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}
              >
                Service Details
              </Text>
              {job.JobLineItems.map((item, index) => (
                <Text key={index}>{item.Service.name.trim()}</Text>
              ))}
              {job.notes && (
                <Text>
                  <Text style={{ fontWeight: 'bold' }}>Notes:</Text> {job.notes}
                </Text>
              )}
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default JobDetailsScreen;
