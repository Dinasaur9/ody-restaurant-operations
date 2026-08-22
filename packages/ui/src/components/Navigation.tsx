import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fontSizes, fontWeights, radii, spacing } from "../tokens";

export interface NavigationItem<T extends string> {
  label: string;
  value: T;
  icon?: ReactNode;
  count?: number;
}

export function Navigation<T extends string>({
  value,
  items,
  onChange,
}: {
  value: T;
  items: readonly NavigationItem<T>[];
  onChange: (value: T) => void;
}) {
  return (
    <View accessibilityRole="tablist" style={styles.navigation}>
      {items.map((item) => {
        const active = value === item.value;
        return (
          <Pressable
            key={item.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(item.value)}
            style={(state) => [
              styles.item,
              active && styles.active,
              (state as typeof state & { hovered?: boolean }).hovered && !active && styles.hovered,
              state.pressed && styles.pressed,
            ]}
          >
            {item.icon}
            <Text style={[styles.label, active && styles.activeLabel]}>{item.label}</Text>
            {item.count !== undefined && (
              <View style={[styles.count, active && styles.activeCount]}>
                <Text style={styles.countLabel}>{item.count}</Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  navigation: { gap: spacing[1] },
  item: { minHeight: 42, flexDirection: "row", alignItems: "center", gap: spacing[3], paddingHorizontal: spacing[3], borderRadius: radii.medium },
  active: { backgroundColor: colors.primarySoft },
  hovered: { backgroundColor: colors.surfaceMuted },
  pressed: { opacity: .72 },
  label: { flex: 1, color: colors.textMuted, fontSize: fontSizes.body, fontWeight: fontWeights.semibold },
  activeLabel: { color: colors.primary, fontWeight: fontWeights.bold },
  count: { minWidth: 22, paddingHorizontal: 6, paddingVertical: 2, alignItems: "center", borderRadius: radii.pill, backgroundColor: colors.surfaceMuted },
  activeCount: { backgroundColor: colors.accent },
  countLabel: { color: colors.text, fontSize: fontSizes.micro, fontWeight: fontWeights.extraBold },
});
