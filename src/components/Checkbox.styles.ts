import { StyleSheet } from 'react-native';
import { colors } from '../styles/colors';

export const styles = StyleSheet.create({
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: colors.green,
    backgroundColor: colors.greenDark,
  },
  checkmark: {
    fontSize: 14,
    color: colors.green,
    fontWeight: '900',
    lineHeight: 18,
  },
});
