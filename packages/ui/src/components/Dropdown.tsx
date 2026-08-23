import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fontSizes, fontWeights, layout, radii, shadows, spacing } from "../tokens";

export interface DropdownOption<T extends string | number> {
  label: string;
  value: T;
  disabled?: boolean;
}

export function Dropdown<T extends string | number>({ label, value, options, onChange, placeholder = "Select an option" }: { label: string; value?: T; options: readonly DropdownOption<T>[]; onChange: (value: T) => void; placeholder?: string }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);
  return <View style={styles.group}><Text style={styles.label}>{label}</Text><Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} aria-expanded={open} onPress={() => setOpen((current) => !current)} style={({ pressed }) => [styles.trigger, open && styles.focused, pressed && styles.pressed]}><Text style={[styles.value, !selected && styles.placeholder]}>{selected?.label ?? placeholder}</Text><Text style={styles.chevron}>{open ? "⌃" : "⌄"}</Text></Pressable>{open && <View style={styles.menu}>{options.map((option) => <Pressable key={String(option.value)} accessibilityRole="menuitem" disabled={option.disabled} onPress={() => { onChange(option.value); setOpen(false); }} style={({ pressed }) => [styles.option, option.value === value && styles.selected, pressed && styles.pressed, option.disabled && styles.disabled]}><Text style={[styles.optionText, option.value === value && styles.selectedText]}>{option.label}</Text>{option.value === value && <Text style={styles.check}>✓</Text>}</Pressable>)}</View>}</View>;
}

const styles = StyleSheet.create({
  group: { position: "relative", zIndex: 20, gap: spacing[2] }, label: { color: colors.text, fontSize: fontSizes.caption, fontWeight: fontWeights.bold }, trigger: { minHeight: layout.minimumTouchTarget, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: colors.border, borderRadius: radii.medium, backgroundColor: colors.surface, paddingHorizontal: spacing[3] }, focused: { borderColor: colors.primary }, pressed: { opacity: .72 }, value: { color: colors.text, fontSize: fontSizes.body }, placeholder: { color: colors.textSubtle }, chevron: { color: colors.textMuted, fontSize: 16 }, menu: { position: "absolute", zIndex: 30, top: 72, left: 0, right: 0, maxHeight: 260, padding: spacing[1], borderWidth: 1, borderColor: colors.border, borderRadius: radii.medium, backgroundColor: colors.surface, ...shadows.overlay }, option: { minHeight: 40, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing[3], borderRadius: radii.small }, selected: { backgroundColor: colors.primarySoft }, disabled: { opacity: .4 }, optionText: { color: colors.text, fontSize: fontSizes.body }, selectedText: { color: colors.primary, fontWeight: fontWeights.bold }, check: { color: colors.primary, fontWeight: fontWeights.extraBold },
});
