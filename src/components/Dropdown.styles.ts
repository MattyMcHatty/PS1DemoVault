import { StyleSheet } from 'react-native';
import { colors } from '../styles/colors';

export const styles = StyleSheet.create({
  dropdown: {
    flex: 1,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  dropdownButtonText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  chevron: {
    fontSize: 16,
    color: colors.textMuted,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    overflow: 'hidden',
  },
  modalTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  optionActive: {
    backgroundColor: 'rgba(0,67,156,0.25)',
  },
  optionIcon: {
    fontSize: 22,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: colors.textSubdued,
    fontWeight: '500',
  },
  optionTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  optionTick: {
    fontSize: 15,
    color: colors.accent,
    fontWeight: '700',
  },
});
