import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColor } from '@/components/Themed';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type AccordionProps = {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onPress: () => void;
};

const Accordion = ({ title, children, isOpen, onPress }: AccordionProps) => {
  const textColor = useThemeColor({}, 'text');
  const dividerColor = useThemeColor({}, 'divider');

  const toggleOpen = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onPress();
  };

  return (
    <View style={{ borderBottomWidth: 1, borderBottomColor: dividerColor, overflow: 'hidden' }}>
      <TouchableOpacity onPress={toggleOpen} style={styles.header}>
        <Text style={[styles.headerText, { color: textColor }]}>{title}</Text>
        <MaterialIcons
          name={isOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
          size={24}
          color={textColor}
        />
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.content}>
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    paddingBottom: 15,
  },
});

export default Accordion;
