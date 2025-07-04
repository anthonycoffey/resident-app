import React, { useEffect, useState } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { View, Text } from '@/components/Themed';
import { useAuth } from '@/lib/providers/AuthProvider';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/config/firebaseConfig';
import Card from '@/components/ui/Card';
import { MaterialIcons } from '@expo/vector-icons';

// Assuming a basic Property type structure
type PropertyAddress = {
  street: string;
  city: string;
  state: string;
  zip: string;
};

type Property = {
  name: string;
  type: string;
  address: PropertyAddress;
};

type DetailRowProps = {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  value: string;
};

const DetailRow = ({ icon, label, value }: DetailRowProps) => (
  <View style={styles.detailRow}>
    <MaterialIcons name={icon} size={24} color="#555" style={styles.icon} />
    <View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  </View>
);

const MyPropertyScreen = () => {
  const { user } = useAuth();
  const [propertyDetails, setPropertyDetails] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      if (!user?.claims?.organizationId || !user?.claims?.propertyId) {
        setError('Organization or Property ID is missing.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const propertyDocRef = doc(
          db,
          'organizations',
          user.claims.organizationId,
          'properties',
          user.claims.propertyId
        );
        const propertyDocSnap = await getDoc(propertyDocRef);

        if (propertyDocSnap.exists()) {
          setPropertyDetails(propertyDocSnap.data() as Property);
        } else {
          setError('Property details not found.');
        }
      } catch (err) {
        console.error('Error fetching property details:', err);
        setError('Failed to fetch property details.');
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!propertyDetails) {
    return (
      <View style={styles.centered}>
        <Text>No property details available.</Text>
      </View>
    );
  }

  const { name, type, address } = propertyDetails;

  return (
    <View style={styles.container}>
      <Card>
        <View style={styles.header}>
          <MaterialIcons name="home-work" size={24} color="black" />
          <Text style={styles.title}>Property Information</Text>
        </View>
        <DetailRow icon="business" label="Property Name" value={name} />
        <DetailRow icon="apartment" label="Property Type" value={type} />
        {address && (
          <DetailRow
            icon="location-on"
            label="Address"
            value={`${address.street}\n${address.city}, ${address.state} ${address.zip}`}
          />
        )}
      </Card>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  errorText: {
    color: 'red',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  icon: {
    marginRight: 15,
    marginTop: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  value: {
    fontSize: 16,
    color: '#555',
    marginTop: 2,
  },
});

export default MyPropertyScreen;
