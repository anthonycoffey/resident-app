import React from 'react';
import {
  TextInput,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  useColorScheme,
  View, // Use the default View
} from 'react-native';
import Colors from '@/constants/Colors';

interface CustomInputProps extends TextInputProps {
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

const Input = (props: CustomInputProps) => {
  const { rightIcon, onRightIconPress, multiline, numberOfLines, style, ...rest } =
    props;
  const theme = useColorScheme() ?? 'light';
  const themeColors = Colors[theme];

  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.input,
          {
            color: themeColors.text,
            borderColor: themeColors.divider,
            backgroundColor: themeColors.input,
          },
          multiline && {
            textAlignVertical: 'top',
            paddingTop: 10,
            height: (numberOfLines || 4) * 20, // Approximate height
          },
          style, // Allow overriding styles
        ]}
        placeholderTextColor={themeColors.label}
        multiline={multiline}
        numberOfLines={numberOfLines}
        {...rest}
      />
      {rightIcon && (
        <TouchableOpacity style={styles.rightIcon} onPress={onRightIconPress}>
          {rightIcon}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    width: '100%',
    paddingVertical: 10,
  },
  rightIcon: {
    position: 'absolute',
    right: 10,
    height: '100%',
    justifyContent: 'center',
  },
});

export default Input;
