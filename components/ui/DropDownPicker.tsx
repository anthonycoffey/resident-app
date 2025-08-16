import React from 'react';
import DropDownPicker, {
  DropDownPickerProps,
} from 'react-native-dropdown-picker';
import { useThemeColor } from '@/components/Themed';
import { MaterialIcons } from '@expo/vector-icons';
import { View } from 'react-native';

const ThemedDropDownPicker = (props: DropDownPickerProps<any>) => {
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({}, 'label');
  const backgroundColor = useThemeColor({}, 'input');
  const borderColor = useThemeColor({}, 'divider');
  const primaryColor = useThemeColor({}, 'primary');
  const colorScheme =
    useThemeColor({}, 'background') === '#000000' ? 'dark' : 'light';

  return (
    <DropDownPicker
      theme={colorScheme.toUpperCase() as 'LIGHT' | 'DARK'}
      style={{
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      }}
      dropDownContainerStyle={{
        backgroundColor: backgroundColor,
        borderColor: borderColor,
      }}
      textStyle={{ color: textColor }}
      placeholderStyle={{ color: placeholderColor, fontSize: 16 }}
      modalTitleStyle={{ color: textColor }}
      modalContentContainerStyle={{
        backgroundColor: backgroundColor,
      }}
      TickIconComponent={({ style }) => (
        <MaterialIcons
          name="check"
          size={20}
          color={primaryColor}
          // @ts-ignore
          style={style}
        />
      )}
      CloseIconComponent={({ style }) => (
        <MaterialIcons
          name="close"
          size={24}
          color={textColor}
          // @ts-ignore
          style={style}
        />
      )}
      {...props}
    />
  );
};

export default ThemedDropDownPicker;
