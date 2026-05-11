import React from 'react';
import { Pressable, Text } from 'react-native';
import { styles } from './Checkbox.styles';

type Props = {
  checked: boolean;
  onPress: () => void;
};

export function Checkbox({ checked, onPress }: Props) {
  return (
    <Pressable
      onPressIn={onPress}
      style={[styles.checkbox, checked && styles.checkboxChecked]}
    >
      {checked && <Text style={styles.checkmark}>✓</Text>}
    </Pressable>
  );
}
