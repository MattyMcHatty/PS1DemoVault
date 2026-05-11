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
    width: 70,
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
  heading: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 3,
  },
  headerSpacer: {
    width: 70,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 24,
  },
  grandTotal: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 8,
  },
  grandTotalLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 2,
  },
  grandTotalCount: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.white,
    lineHeight: 38,
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    backgroundColor: colors.green,
    borderRadius: 2,
  },
  progressFillGold: {
    backgroundColor: colors.gold,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  sectionCount: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  sectionPct: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.green,
  },
  regions: {
    marginTop: 4,
    gap: 6,
    paddingLeft: 4,
  },
  regionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  regionFlag: {
    fontSize: 16,
    width: 24,
    textAlign: 'center',
  },
  regionName: {
    flex: 1,
    fontSize: 13,
    color: colors.textMuted,
  },
  regionCount: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSubdued,
    minWidth: 50,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
});
