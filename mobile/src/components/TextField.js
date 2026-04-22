import { StyleSheet, Text, TextInput, View } from 'react-native';
import { theme } from '../constants/theme';

export default function TextField({ label, multiline = false, style, ...props }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multilineInput, style]}
        placeholderTextColor={theme.colors.muted}
        multiline={multiline}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  input: {
    minHeight: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
  },
  multilineInput: {
    minHeight: 100,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
});

