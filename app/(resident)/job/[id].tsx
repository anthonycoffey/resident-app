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

const JobDetailsScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const primaryColor = useThemeColor({}, 'primary');
  const tintColor = useThemeColor({}, 'tint');
  const errorColor = useThemeColor({}, 'error');
  const successColor = useThemeColor({}, 'success');
  const chipColor = useThemeColor({}, 'chip');
  const textMutedColor = useThemeColor({}, 'textMuted');
  const white = useThemeColor({}, 'white');
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchJob = useCallback(() => {
    if (!id) return Promise.resolve();
    return getPhoenixJobDetails(id)
      .then((data) => {
        setJob(data);
        setError(null);
      })
      .catch((err) => {
        setError('Failed to load job details.');
        console.error(err);
        // Re-throw to be caught by callers
        throw err;
      });
  }, [id]);

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
        {error && (
          <Text style={{ color: errorColor, textAlign: 'center', marginTop: 20 }}>
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
                        color={primaryColor}
                      />
                      <Text
                        style={{
                          marginLeft: 5,
                          color: primaryColor,
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
                      <MaterialIcons name='call' size={24} color={primaryColor} />
                      <Text
                        style={{
                          marginLeft: 5,
                          color: primaryColor,
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
                // provider={
                  // Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined
                // }
                provider={PROVIDER_GOOGLE}
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
                      strokeWidth={3}
                      strokeColor={primaryColor}
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
                style={{ fontSize: 16, fontWeight: 'bold', color: successColor }}
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
