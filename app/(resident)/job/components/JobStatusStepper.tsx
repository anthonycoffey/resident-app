import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useThemeColor } from '@/components/Themed';
import { MaterialIcons } from '@expo/vector-icons';

interface StepProps {
  isCompleted: boolean;
  isCurrent: boolean;
  label: string;
}

const JobStatusStepper = ({ currentStep }: { currentStep: number }) => {
  const primaryColor = useThemeColor({}, 'primary');
  const textMutedColor = useThemeColor({}, 'textMuted');
  const tintColor = useThemeColor({}, 'tint');

  const Step: React.FC<StepProps> = ({ isCompleted, isCurrent, label }) => {
    const iconColor = isCompleted || isCurrent ? primaryColor : textMutedColor;
    const textColor = isCurrent
      ? tintColor
      : isCompleted
      ? primaryColor
      : textMutedColor;
    const fontWeight = isCurrent ? 'bold' : 'normal';

    return (
      <View style={styles.stepContainer}>
        <MaterialIcons
          name={isCompleted ? 'check-circle' : 'radio-button-unchecked'}
          size={24}
          color={iconColor}
        />
        <Text style={[styles.stepLabel, { color: textColor, fontWeight }]}>
          {label}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Step
        label='En Route'
        isCompleted={currentStep > 1}
        isCurrent={currentStep === 1}
      />
      <View
        style={[
          styles.line,
          { backgroundColor: currentStep > 1 ? primaryColor : textMutedColor },
        ]}
      />
      <Step
        label='In Progress'
        isCompleted={currentStep > 2}
        isCurrent={currentStep === 2}
      />
      <View
        style={[
          styles.line,
          { backgroundColor: currentStep > 2 ? primaryColor : textMutedColor },
        ]}
      />
      <Step
        label='Completed'
        isCompleted={currentStep >= 3}
        isCurrent={currentStep === 3}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 0
  },
  stepContainer: {
    alignItems: 'center',
    flex: 1,
  },
  stepLabel: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 12,
  },
  line: {
    height: 2,
    flex: 1,
    marginTop: 11, // Align with the center of the icon
  },
});

export default JobStatusStepper;
