import * as Application from 'expo-application';
import * as Updates from 'expo-updates';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';
import SectionCard from './SectionCard';
import PrimaryButton from './PrimaryButton';

export default function UpdatePrompt({
  visible,
  loading,
  onApply,
  onLater,
}) {
  const appVersion = Application.nativeApplicationVersion || '1.0.0';
  const buildVersion = Application.nativeBuildVersion || '1';
  const channel = Updates.channel || 'production';

  return (
    <Modal animationType="fade" transparent visible={visible} statusBarTranslucent>
      <View style={styles.backdrop}>
        <SectionCard style={styles.card}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Update Ready</Text>
          </View>
          <Text style={styles.title}>New update available</Text>
          <Text style={styles.description}>
            A newer version has been downloaded in the background. Update now to apply the latest fixes and improvements.
          </Text>

          <View style={styles.metaCard}>
            <Text style={styles.metaText}>{`Version ${appVersion}`}</Text>
            <Text style={styles.metaText}>{`Build ${buildVersion}`}</Text>
            <Text style={styles.metaText}>{`Channel ${channel}`}</Text>
          </View>

          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={theme.colors.primary} />
              <Text style={styles.loadingText}>Applying update...</Text>
            </View>
          ) : null}

          <PrimaryButton
            title={loading ? 'Updating...' : 'Update Now'}
            onPress={onApply}
            loading={loading}
            icon="cloud-download-outline"
          />
          <Pressable disabled={loading} onPress={onLater} style={styles.laterButton}>
            <Text style={styles.laterButtonText}>Later</Text>
          </Pressable>
        </SectionCard>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    padding: 24,
    justifyContent: 'center',
  },
  card: {
    gap: 16,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badgeText: {
    color: theme.colors.primaryDark,
    fontWeight: '800',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  title: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  description: {
    color: theme.colors.muted,
    lineHeight: 22,
    fontSize: 15,
  },
  metaCard: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.md,
    padding: 14,
    gap: 6,
  },
  metaText: {
    color: theme.colors.primaryDark,
    fontWeight: '700',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    color: theme.colors.muted,
    fontWeight: '600',
  },
  laterButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  laterButtonText: {
    color: theme.colors.muted,
    fontWeight: '700',
  },
});
