import { useState } from "react";
import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { colors, fontSizes, fontWeights, layout, radii, spacing } from "../tokens";

export interface FieldProps extends TextInputProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
}

export function Field({ label, hint, error, required, style, ...props }: FieldProps) {
  const [focused, setFocused] = useState(false);
  const helpText = error ?? hint;

  return (
    <View style={styles.group}>
      <Text style={styles.label}>
        {label}{required && <Text style={styles.required}> *</Text>}
      </Text>
      <TextInput
        {...props}
        accessibilityLabel={label}
        accessibilityState={{ disabled: !props.editable }}
        placeholderTextColor={colors.textSubtle}
        onFocus={(event) => { setFocused(true); props.onFocus?.(event); }}
        onBlur={(event) => { setFocused(false); props.onBlur?.(event); }}
        style={[styles.input, focused && styles.focused, error && styles.error, props.editable === false && styles.disabled, style]}
      />
      {helpText && <Text style={[styles.help, error && styles.errorText]}>{helpText}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: spacing[2] },
  label: { color: colors.text, fontSize: fontSizes.caption, fontWeight: fontWeights.bold },
  required: { color: colors.danger },
  input: { minHeight: layout.minimumTouchTarget, color: colors.text, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.medium, paddingHorizontal: spacing[3], fontSize: fontSizes.body, outlineStyle: "none" } as never,
  focused: { borderColor: colors.primary, outlineStyle: "solid", outlineWidth: 3, outlineColor: colors.focusRing } as never,
  error: { borderColor: colors.danger },
  disabled: { backgroundColor: colors.surfaceMuted, color: colors.textSubtle },
  help: { color: colors.textMuted, fontSize: fontSizes.caption },
  errorText: { color: colors.danger },
});
