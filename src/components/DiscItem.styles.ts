import { StyleSheet } from 'react-native';
import { colors } from '../styles/colors';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 8,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 22,
  },
  titleCollected: {
    color: colors.textMuted,
  },
  image: {
    width: 140,
    height: 110,
    borderRadius: 6,
    backgroundColor: colors.border,
  },
  imagePlaceholder: {
    opacity: 0.4,
  },
  flagOverlay: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 4,
    paddingHorizontal: 3,
    paddingVertical: 1,
    overflow: 'hidden',
  },
});
