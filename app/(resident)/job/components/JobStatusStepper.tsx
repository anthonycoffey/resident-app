import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useThemeColor } from '@/components/Themed';
import { MaterialIcons } from '@expo/vector-icons';

interface StepProps {
  isCompleted: boolean;
  isCurrent: boolean;
  label: string;
}

const steps = [
  'Assigned',
  'En Route',
  'In Progress',
  'Completed',
];

const JobStatusStepper = ({ currentStep }: { currentStep: number }) => {
  console.log('--- JobStatusStepper Render ---');
  console.log('currentStep:', currentStep);

  const primaryColor = useThemeColor({}, 'primary');
  const textMutedColor = useThemeColor({}, 'textMuted');
  const tintColor = useThemeColor({}, 'tint');

  console.log('Theme Colors:', { primaryColor, textMutedColor, tintColor });

  const Step: React.FC<StepProps> = ({ isCompleted, isCurrent, label }) => {
    console.log(`--- Step Render: ${label} ---`);
    console.log('Props:', { isCompleted, isCurrent, label });

    const iconColor = isCompleted || isCurrent ? primaryColor : textMutedColor;
    const textColor = isCurrent
      ? tintColor
      : isCompleted
      ? primaryColor
      : textMutedColor;
    const fontWeight = isCurrent ? 'bold' : 'normal';

    console.log('Calculated Styles:', { iconColor, textColor, fontWeight });

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
      {steps.map((label, idx) => {
        const isCompleted = currentStep > idx + 1;
        const isCurrent = currentStep === idx + 1;
        const isLineActive = currentStep > idx + 1;

        console.log(`--- Mapping Step: ${label} (Index: ${idx}) ---`);
        console.log('Calculated Status:', { isCompleted, isCurrent });
        console.log('Is connecting line active?', isLineActive);

        return (
          <React.Fragment key={label}>
            <Step
              label={label}
              isCompleted={isCompleted}
              isCurrent={isCurrent}
            />
            {idx < steps.length - 1 && (
              <View
                style={[
                  styles.line,
                  { backgroundColor: isLineActive ? primaryColor : textMutedColor },
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
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
    width: 75
  },
  line: {
    height: 2,
    flex: 1,
    marginTop: 11,
  },
});

export default JobStatusStepper;
