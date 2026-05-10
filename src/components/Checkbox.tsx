import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { styles } from './Checkbox.styles';

type Props = {
  checked: boolean;
  onPress: () => void;
};

export function Checkbox({ checked, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.checkbox, checked && styles.checkboxChecked]}
      activeOpacity={0.7}
    >
      {checked && <Text style={styles.checkmark}>✓</Text>}
    </TouchableOpacity>
  );
}
