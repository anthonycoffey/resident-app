import React from 'react';
import {
  TextInput,
  StyleSheet,
  TextInputProps,
  View,
  TouchableOpacity,
} from 'react-native';
import { useThemeColor } from '../Themed';
import { FontAwesome } from '@expo/vector-icons';

interface CustomInputProps extends TextInputProps {
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

const Input = (props: CustomInputProps) => {
  const { rightIcon, onRightIconPress, multiline, numberOfLines, ...rest } = props;
  const color = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'divider');
  const backgroundColor = useThemeColor({}, 'input');
  const placeholderColor = useThemeColor({}, 'label');

  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.input,
          { color, borderColor, backgroundColor },
          multiline && {
            textAlignVertical: 'top',
            paddingTop: 10,
            height: (numberOfLines || 4) * 20, // Approximate height
          },
        ]}
        placeholderTextColor={placeholderColor}
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
