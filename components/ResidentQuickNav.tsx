import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColor } from '@/components/Themed';

type QuickNavButtonProps = {
  // TODO: Use a stricter type for href from expo-router if possible
  href: any;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  text: string;
};

const QuickNavButton = ({ href, icon, text }: QuickNavButtonProps) => {
  const color = useThemeColor({}, 'text');
  return (
    <Link href={href} asChild>
      <TouchableOpacity style={styles.button}>
        <MaterialIcons name={icon} size={32} color={color} />
        <Text style={[styles.buttonText, { color }]}>{text}</Text>
      </TouchableOpacity>
    </Link>
  );
};

const ResidentQuickNav = () => {
  return (
    <View>
      <Text style={styles.title}>Quick Navigation</Text>
      <View style={styles.container}>
        <QuickNavButton href="/my-property" icon="apartment" text="My Property" />
        <QuickNavButton href="/service-request" icon="build" text="Service Request" />
        <QuickNavButton href="/ai-assistant" icon="smart-toy" text="AI Assistant" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  button: {
    alignItems: 'center',
    padding: 10,
  },
  buttonText: {
    marginTop: 5,
    fontSize: 12,
  },
});

export default ResidentQuickNav;
