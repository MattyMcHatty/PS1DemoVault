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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backArrow: {
    fontSize: 28,
    color: colors.accent,
    lineHeight: 32,
    fontWeight: '300',
  },
  backLabel: {
    fontSize: 16,
    color: colors.accent,
    fontWeight: '600',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 16,
    lineHeight: 30,
  },
  productCode: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 16,
    marginTop: -10,
  },
  imageContainer: {
    gap: 8,
    marginBottom: 24,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    backgroundColor: colors.border,
  },
imagePlaceholder: {
    opacity: 0.4,
  },
  coupledBlock: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#c0392b',
  },
  coupledLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#e07070',
    letterSpacing: 2,
    marginBottom: 6,
  },
  coupledGame: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 21,
  },
  notesBlock: {
    marginBottom: 24,
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  notesLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 2,
    marginBottom: 6,
  },
  notesText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 21,
  },
  games: {
    gap: 20,
  },
  categoryBlock: {
    gap: 6,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  gameTitle: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
});
