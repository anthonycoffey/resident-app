import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Text, View, useThemeColor } from '@/components/Themed';
import { MaterialIcons } from '@expo/vector-icons';

type JourneySelectionProps = {
  onSelectJourney: (journey: 'on-premise' | 'off-premise') => void;
};

const JourneySelection = ({ onSelectJourney }: JourneySelectionProps) => {
  const primaryColor = useThemeColor({}, 'primary');
  const cardBackgroundColor = useThemeColor({}, 'card');

  return (
    <View style={{ backgroundColor: 'transparent' }}>
      <Text style={styles.title}>New Service Request</Text>
      <Text style={styles.subtitle}>
        Where will this service be performed?
      </Text>
      <TouchableOpacity
        style={[
          styles.selectionBox,
          { backgroundColor: cardBackgroundColor, borderColor: primaryColor },
        ]}
        onPress={() => onSelectJourney('on-premise')}
      >
        <MaterialIcons name='home' size={32} color={primaryColor} />
        <Text style={styles.selectionText}>My Property Address</Text>
        <Text style={styles.selectionSubtext}>
          For services at your registered address.
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.selectionBox,
          { backgroundColor: cardBackgroundColor, borderColor: primaryColor },
        ]}
        onPress={() => onSelectJourney('off-premise')}
      >
        <MaterialIcons name='search' size={32} color={primaryColor} />
        <Text style={styles.selectionText}>Different Address</Text>
        <Text style={styles.selectionSubtext}>
          For services at any other location.
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  selectionBox: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  selectionText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
  },
  selectionSubtext: {
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
});

export default JourneySelection;
