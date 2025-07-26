import React from 'react';
import { View, Text, useThemeColor } from '@/components/Themed';
import { StyleSheet, Image, TouchableOpacity } from 'react-native';
import Card from './Card';
import { Bulletin } from '@/lib/types/bulletin';
import { formatRelativeTime } from '@/lib/utils/dates';

type CommunityBulletinCardProps = {
  bulletin: Bulletin;
};

const CommunityBulletinCard = ({ bulletin }: CommunityBulletinCardProps) => {
  const labelColor = useThemeColor({}, 'label');
  const mutedColor = useThemeColor({}, 'textMuted');

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{bulletin.title}</Text>
      </View>
      <Text style={styles.message}>{bulletin.body}</Text>
      <View style={styles.footer}>
        <Text style={[styles.date, { color: mutedColor }]}>
          {formatRelativeTime(bulletin.createdAt)}
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 0,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 14,
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  date: {
    fontSize: 12,
  },
});

export default CommunityBulletinCard;
