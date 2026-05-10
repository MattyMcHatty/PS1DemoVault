import { StyleSheet } from 'react-native';
import { colors } from '../styles/colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 16,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    gap: 5,
  },
  hamburgerLine: {
    height: 2,
    backgroundColor: colors.textMuted,
    borderRadius: 2,
  },
  logoWrap: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.accent,
    letterSpacing: 6,
  },
  logoSub: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 5,
    marginTop: -4,
  },
  filterBar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
});
