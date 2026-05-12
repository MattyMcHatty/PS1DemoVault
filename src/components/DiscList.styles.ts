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
  gridIcon: {
    gap: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridIconRow: {
    flexDirection: 'row',
    gap: 4,
  },
  gridDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: colors.textMuted,
  },
  gridRow: {
    paddingHorizontal: 12,
  },
  contentArea: {
    flex: 1,
  },
  searchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
  },
  emptyRegionText: {
    marginTop: 48,
    textAlign: 'center',
    fontSize: 15,
    color: colors.textMuted,
  },
  searchPrompt: {
    marginTop: 48,
    textAlign: 'center',
    fontSize: 14,
    color: colors.textMuted,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchResultImage: {
    width: 80,
    height: 80,
    borderRadius: 6,
    backgroundColor: colors.border,
  },
  searchResultImageEmpty: {
    opacity: 0.3,
  },
  searchResultText: {
    flex: 1,
    gap: 4,
  },
  searchResultTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 20,
  },
  searchResultGame: {
    fontSize: 12,
    color: colors.textSubdued,
    fontStyle: 'italic',
  },
  searchResultMeta: {
    fontSize: 12,
    color: colors.textMuted,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  iconButton: {
    width: 36,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIconText: {
    fontSize: 22,
    color: colors.textMuted,
    lineHeight: 26,
  },
  searchIconActive: {
    color: colors.accent,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    fontSize: 15,
    color: colors.text,
  },
  searchClose: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchCloseText: {
    fontSize: 16,
    color: colors.textMuted,
  },
  reverseButton: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 10,
  },
  reverseButtonActive: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(0,67,156,0.15)',
  },
  reverseButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.textMuted,
  },
  reverseButtonTextActive: {
    color: colors.accent,
  },
  statsBar: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 6,
  },
  statsText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  progressTrack: {
    height: 3,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 3,
    backgroundColor: colors.green,
    borderRadius: 2,
  },
  progressFillGold: {
    backgroundColor: colors.gold,
  },
});
