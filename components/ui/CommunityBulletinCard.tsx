import React from 'react';
import { View, Text, useThemeColor } from '@/components/Themed';
import { StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Card from './Card';
import Button from './Button';
import Chip from './Chip';

type BulletinStatus = 'unclaimed' | 'claimed' | 'resolved';

export type CommunityBulletin = {
  id: string;
  type: 'guest-violation' | 'general-message' | 'event';
  title: string;
  message: string;
  imageUrl?: string;
  licensePlate?: string;
  status: BulletinStatus;
};

type CommunityBulletinCardProps = {
  bulletin: CommunityBulletin;
};

const getStatusColorName = (
  status: BulletinStatus
): 'error' | 'warning' | 'success' | 'secondary' => {
  switch (status) {
    case 'unclaimed':
      return 'error';
    case 'claimed':
      return 'warning';
    case 'resolved':
      return 'success';
    default:
      return 'secondary';
  }
};

const CommunityBulletinCard = ({ bulletin }: CommunityBulletinCardProps) => {
  const labelColor = useThemeColor({}, 'label');

  const obfuscateLicensePlate = (plate?: string) => {
    if (!plate) return '';
    return `****${plate.slice(-4)}`;
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{bulletin.title}</Text>
        <TouchableOpacity>
          <MaterialIcons name="more-vert" size={24} color={labelColor} />
        </TouchableOpacity>
      </View>
      {bulletin.imageUrl && (
        <Image source={{ uri: bulletin.imageUrl }} style={styles.image} />
      )}
      {bulletin.licensePlate && (
        <View style={styles.plateContainer}>
          <Text style={styles.plateText}>
            {obfuscateLicensePlate(bulletin.licensePlate)}
          </Text>
        </View>
      )}
      <Text style={styles.message}>{bulletin.message}</Text>
      <View style={styles.footer}>
        <Chip
          label={bulletin.status}
          variant={getStatusColorName(bulletin.status)}
        />
        <View style={styles.buttonContainer}>
          <Button
            title="This is my vehicle"
            onPress={() => {}}
            variant="outline"
            size="sm"
          />
          <Button
            title="This is my guest"
            onPress={() => {}}
            variant="filled"
            size="sm"
          />
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 200,
    marginTop: 12,
  },
  plateContainer: {
    marginTop: 12,
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#EFEFEF',
    borderRadius: 6,
  },
  plateText: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  message: {
    fontSize: 14,
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'transparent',
  },
});

export default CommunityBulletinCard;
