import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TextInput, View } from 'react-native';
import { theme } from '../constants/theme';

export default function SearchField({
  value,
  onChangeText,
  placeholder = 'Search...',
  style,
}) {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name="search" size={18} color={theme.colors.subtle} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.subtle}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 14,
    ...theme.shadows.soft,
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 15,
  },
});
