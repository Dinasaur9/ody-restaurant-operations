import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fontSizes, fontWeights, radii, shadows, spacing } from "../tokens";

export function Toggle({ value, onChange, label, description, disabled = false }: { value: boolean; onChange: (value: boolean) => void; label: string; description?: string; disabled?: boolean }) {
  return <Pressable accessibilityRole="switch" accessibilityState={{ checked: value, disabled }} disabled={disabled} onPress={() => onChange(!value)} style={(state) => [styles.row, (state as typeof state & { hovered?: boolean }).hovered && !disabled && styles.hovered, disabled && styles.disabled]}><View style={styles.copy}><Text style={styles.label}>{label}</Text>{description && <Text style={styles.description}>{description}</Text>}</View><View style={[styles.track, value && styles.trackActive]}><View style={styles.knob} /></View></Pressable>;
}

const styles = StyleSheet.create({
  row: { minHeight: 58, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing[4], paddingHorizontal: spacing[2], borderRadius: radii.medium }, hovered: { backgroundColor: colors.backgroundSubtle }, disabled: { opacity: .45 }, copy: { flex: 1, gap: 2 }, label: { color: colors.text, fontSize: fontSizes.body, fontWeight: fontWeights.semibold }, description: { color: colors.textMuted, fontSize: fontSizes.caption }, track: { width: 44, height: 26, padding: 3, borderRadius: radii.pill, justifyContent: "center", alignItems: "flex-start", backgroundColor: colors.disabled }, trackActive: { backgroundColor: colors.primary, alignItems: "flex-end" }, knob: { width: 20, height: 20, borderRadius: radii.pill, backgroundColor: colors.surface, ...shadows.subtle },
});
