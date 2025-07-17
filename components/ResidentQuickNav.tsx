import React from 'react';
import { StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';
import { Link } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';

type QuickNavButtonProps = {
  href: any; // TODO: Use a stricter type for href from expo-router
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  text: string;
};

const QuickNavButton = ({ href, icon, text }: QuickNavButtonProps) => {
  const theme = useColorScheme() ?? 'light';
  const color = Colors[theme].text;

  return (
    <Link href={href} asChild>
      <TouchableOpacity style={styles.button}>
        <MaterialIcons name={icon} size={32} color={color} />
        <Text style={styles.buttonText}>{text}</Text>
      </TouchableOpacity>
    </Link>
  );
};

const ResidentQuickNav = () => {
  return (
    <View>
      <Text variant="subtitle" style={styles.title}>
        Quick Navigation
      </Text>
      <View style={styles.container}>
        <QuickNavButton href="/my-property" icon="apartment" text="My Property" />
        <QuickNavButton
          href="/service-request"
          icon="build"
          text="Service Request"
        />
        <QuickNavButton
          href="/report-violation"
          icon="report-problem"
          text="Report Violation"
        />
        <QuickNavButton
          href="/ai-assistant"
          icon="smart-toy"
          text="AI Assistant"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-evenly', // Use space-evenly for better distribution
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
