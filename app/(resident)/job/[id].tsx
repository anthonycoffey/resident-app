import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Stack, useLocalSearchParams, useNavigation } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { getPhoenixJobDetails, Job } from '@/lib/services/phoenixService';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';

const JobDetailsScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f2f5' }}>
      <Stack.Screen
        options={{
          headerTitle: 'Service Request Details',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ paddingHorizontal: 10 }}
            >
              <MaterialIcons name='arrow-back' size={24} color='black' />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView contentContainerStyle={{ padding: 15 }}>
        {loading && <ActivityIndicator size='large' color='#0000ff' />}
        {error && (
          <Text style={{ color: 'red', textAlign: 'center', marginTop: 20 }}>
            {error}
          </Text>
        )}
        {job && (
          <>
            <Card
              style={{
                marginBottom: 15,
                padding: 15,
                borderRadius: 10,
                backgroundColor: 'white',
              }}
            >
              <Text
                style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}
              >
                Technician Information
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Avatar
                  source={{ uri: job.assignedTechnician.avatar }}
                  size={60}
                />
                <View style={{ marginLeft: 15, flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600' }}>
                    {job.assignedTechnician.fullName}
                  </Text>
                  <View style={{ flexDirection: 'row', marginTop: 8 }}>
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

            <Card
              style={{
                marginBottom: 15,
                padding: 15,
                borderRadius: 10,
                backgroundColor: 'white',
              }}
            >
              <Text
                style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}
              >
                Service Location
              </Text>
              <Text>{job.Address.fullAddress}</Text>

              <MapView
                provider={PROVIDER_GOOGLE}
                style={{ height: 200, marginTop: 10, borderRadius: 8 }}
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
              </MapView>
            </Card>

            <Card
              style={{
                marginBottom: 15,
                padding: 15,
                borderRadius: 10,
                backgroundColor: 'white',
              }}
            >
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

            <Card
              style={{
                marginBottom: 15,
                padding: 15,
                borderRadius: 10,
                backgroundColor: 'white',
              }}
            >
              <Text
                style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}
              >
                Service Details
              </Text>
              <Text>
                <Text style={{ fontWeight: 'bold' }}>Service Type:</Text>{' '}
                {job.serviceType}
              </Text>
              <Text>
                <Text style={{ fontWeight: 'bold' }}>Summary:</Text>{' '}
                {job.serviceSummary}
              </Text>
              {job.customerNotes && (
                <Text>
                  <Text style={{ fontWeight: 'bold' }}>Notes:</Text>{' '}
                  {job.customerNotes}
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
