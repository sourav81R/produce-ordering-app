import { StyleSheet, Text, TextInput, View } from 'react-native';
import { theme } from '../constants/theme';

export default function TextField({
  label,
  multiline = false,
  style,
  caption,
  ...props
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multilineInput, style]}
        placeholderTextColor={theme.colors.subtle}
        multiline={multiline}
        {...props}
      />
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  input: {
    minHeight: 52,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    fontSize: 15,
    ...theme.shadows.soft,
  },
  multilineInput: {
    minHeight: 100,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
  caption: {
    color: theme.colors.subtle,
    fontSize: 12,
    lineHeight: 18,
  },
});
