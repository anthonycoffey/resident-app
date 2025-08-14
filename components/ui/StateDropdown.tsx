import React from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import Colors from '@/constants/Colors';

const states = [
  { label: 'Alabama', value: 'AL' },
  { label: 'Alaska', value: 'AK' },
  { label: 'Arizona', value: 'AZ' },
  { label: 'Arkansas', value: 'AR' },
  { label: 'California', value: 'CA' },
  { label: 'Colorado', value: 'CO' },
  { label: 'Connecticut', value: 'CT' },
  { label: 'Delaware', value: 'DE' },
  { label: 'Florida', value: 'FL' },
  { label: 'Georgia', value: 'GA' },
  { label: 'Hawaii', value: 'HI' },
  { label: 'Idaho', value: 'ID' },
  { label: 'Illinois', value: 'IL' },
  { label: 'Indiana', value: 'IN' },
  { label: 'Iowa', value: 'IA' },
  { label: 'Kansas', value: 'KS' },
  { label: 'Kentucky', value: 'KY' },
  { label: 'Louisiana', value: 'LA' },
  { label: 'Maine', value: 'ME' },
  { label: 'Maryland', value: 'MD' },
  { label: 'Massachusetts', value: 'MA' },
  { label: 'Michigan', value: 'MI' },
  { label: 'Minnesota', value: 'MN' },
  { label: 'Mississippi', value: 'MS' },
  { label: 'Missouri', value: 'MO' },
  { label: 'Montana', value: 'MT' },
  { label: 'Nebraska', value: 'NE' },
  { label: 'Nevada', value: 'NV' },
  { label: 'New Hampshire', value: 'NH' },
  { label: 'New Jersey', value: 'NJ' },
  { label: 'New Mexico', value: 'NM' },
  { label: 'New York', value: 'NY' },
  { label: 'North Carolina', value: 'NC' },
  { label: 'North Dakota', value: 'ND' },
  { label: 'Ohio', value: 'OH' },
  { label: 'Oklahoma', value: 'OK' },
  { label: 'Oregon', value: 'OR' },
  { label: 'Pennsylvania', value: 'PA' },
  { label: 'Rhode Island', value: 'RI' },
  { label: 'South Carolina', value: 'SC' },
  { label: 'South Dakota', value: 'SD' },
  { label: 'Tennessee', value: 'TN' },
  { label: 'Texas', value: 'TX' },
  { label: 'Utah', value: 'UT' },
  { label: 'Vermont', value: 'VT' },
  { label: 'Virginia', value: 'VA' },
  { label: 'Washington', value: 'WA' },
  { label: 'West Virginia', value: 'WV' },
  { label: 'Wisconsin', value: 'WI' },
  { label: 'Wyoming', value: 'WY' },
];

interface StateDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

const StateDropdown: React.FC<StateDropdownProps> = ({ value, onChange }) => {
  const theme = useColorScheme() ?? 'light';
  const themeColors = Colors[theme];

  const styles = StyleSheet.create({
    dropdown: {
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      width: '100%',
      paddingVertical: 16,
      fontSize: 16,
      backgroundColor: themeColors.input,
      borderColor: themeColors.divider,
      marginBottom: 12,
    },
    placeholderStyle: {
      fontSize: 16,
      color: themeColors.label,
    },
    selectedTextStyle: {
      fontSize: 16,
      color: themeColors.text,
    },
    inputSearchStyle: {
      height: 40,
      fontSize: 16,
      color: themeColors.text,
      backgroundColor: themeColors.input,
    },
    containerStyle: {
      backgroundColor: themeColors.input,
      borderRadius: 8,
      borderColor: themeColors.divider,
      borderWidth: 1,
    },
    itemContainerStyle: {
      backgroundColor: themeColors.input,
    },
    itemTextStyle: {
      color: themeColors.text,
      fontSize: 16,
    },
  });

  return (
    <Dropdown
      style={styles.dropdown}
      placeholderStyle={styles.placeholderStyle}
      selectedTextStyle={styles.selectedTextStyle}
      inputSearchStyle={styles.inputSearchStyle}
      containerStyle={styles.containerStyle}
      itemContainerStyle={styles.itemContainerStyle}
      itemTextStyle={styles.itemTextStyle}
      activeColor={themeColors.background}
      data={states}
      search
      maxHeight={300}
      labelField='label'
      valueField='value'
      placeholder='Select state'
      searchPlaceholder='Search...'
      value={value}
      onChange={(item) => {
        onChange(item.value);
      }}
    />
  );
};

export default StateDropdown;
