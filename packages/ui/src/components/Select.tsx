import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fontSizes, fontWeights, radii, shadows, spacing } from "../tokens";

export interface SelectOption<T extends string> { label: string; value: T; disabled?: boolean }

export function SegmentedSelect<T extends string>({ label, value, options, onChange }: { label?: string; value: T; options: readonly SelectOption<T>[]; onChange: (value: T) => void }) {
  return (
    <View style={styles.group}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View accessibilityRole="radiogroup" style={styles.control}>
        {options.map((option) => {
          const active = option.value === value;
          return (
            <Pressable key={option.value} accessibilityRole="radio" accessibilityState={{ checked: active, disabled: option.disabled }} aria-checked={active} aria-disabled={option.disabled} disabled={option.disabled} onPress={() => onChange(option.value)} style={(state) => [styles.option, active && styles.active, (state as typeof state & { hovered?: boolean }).hovered && !active && styles.hovered, state.pressed && styles.pressed, option.disabled && styles.disabled]}>
              <Text style={[styles.optionText, active && styles.activeText]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: spacing[2] }, label: { color: colors.text, fontSize: fontSizes.caption, fontWeight: fontWeights.bold }, control: { alignSelf: "flex-start", flexDirection: "row", padding: 3, borderRadius: radii.medium, backgroundColor: colors.surfaceMuted, gap: 2 }, option: { minHeight: 36, justifyContent: "center", paddingHorizontal: spacing[3], borderRadius: 9 }, active: { backgroundColor: colors.surface, ...shadows.subtle }, hovered: { backgroundColor: colors.backgroundSubtle }, pressed: { opacity: 0.7 }, disabled: { opacity: 0.4 }, optionText: { color: colors.textMuted, fontSize: fontSizes.caption, fontWeight: fontWeights.semibold }, activeText: { color: colors.text },
});
