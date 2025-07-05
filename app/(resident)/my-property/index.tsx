import React, { useEffect, useState } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { View, Text, useThemeColor } from '@/components/Themed';
import { useAuth } from '@/lib/providers/AuthProvider';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/config/firebaseConfig';
import Card from '@/components/ui/Card';
import Divider from '@/components/ui/Divider';
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
  iconColor: string;
  labelColor: string;
  valueColor: string;
  hideDivider?: boolean;
};

const DetailRow = ({ icon, label, value, iconColor, labelColor, valueColor, hideDivider = false }: DetailRowProps) => (
  <View style={{ backgroundColor: 'transparent' }}>
    <View style={styles.detailRow}>
      <MaterialIcons name={icon} size={24} color={iconColor} style={styles.icon} />
      <View style={{ backgroundColor: 'transparent' }}>
        <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
        <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
      </View>
    </View>
    {!hideDivider && <Divider />}
  </View>
);

const MyPropertyScreen = () => {
  const { user } = useAuth();
  const [propertyDetails, setPropertyDetails] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const textColor = useThemeColor({}, 'text');
  const labelColor = useThemeColor({}, 'label');
  const primaryColor = useThemeColor({}, 'primary');
  const errorColor = useThemeColor({}, 'error');

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
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.errorText, { color: errorColor }]}>{error}</Text>
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
        <View style={[styles.header, { backgroundColor: 'transparent' }]}>
          <MaterialIcons name="home-work" size={24} color={textColor} />
          <Text style={styles.title}>Property Information</Text>
        </View>
        <DetailRow icon="business" label="Property Name" value={name} iconColor={labelColor} labelColor={textColor} valueColor={labelColor} />
        <DetailRow icon="apartment" label="Property Type" value={type} iconColor={labelColor} labelColor={textColor} valueColor={labelColor} />
        {address && (
          <DetailRow
            icon="location-on"
            label="Address"
            value={`${address.street}\n${address.city}, ${address.state} ${address.zip}`}
            iconColor={labelColor}
            labelColor={textColor}
            valueColor={labelColor}
            hideDivider={true}
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
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  errorText: {
    fontSize: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 15,
    backgroundColor: 'transparent',
  },
  icon: {
    marginRight: 15,
    marginTop: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 16,
    marginTop: 2,
  },
});

export default MyPropertyScreen;
