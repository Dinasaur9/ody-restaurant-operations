import type { PropsWithChildren } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
} from "react-native";
import { colors, fontSizes, fontWeights, layout, radii, spacing } from "../tokens";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export interface ButtonProps extends PressableProps {
  variant?: ButtonVariant;
  loading?: boolean;
}

export function Button({
  children,
  variant = "primary",
  loading = false,
  disabled,
  style,
  ...props
}: PropsWithChildren<ButtonProps>) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      {...props}
      style={(state) => {
        const interaction = state as typeof state & {
          hovered?: boolean;
          focused?: boolean;
        };
        return [
        styles.base,
        styles[variant],
        interaction.hovered && styles.hovered,
        interaction.focused && styles.focused,
        state.pressed && styles.pressed,
        isDisabled && styles.disabled,
        typeof style === "function" ? style(state) : style,
        ];
      }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" ? colors.textInverse : colors.primary}
        />
      ) : (
        <Text
          style={[
            styles.label,
            variant === "primary" && styles.primaryLabel,
            variant === "danger" && styles.dangerLabel,
          ]}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: layout.minimumTouchTarget,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: spacing[4],
    borderRadius: radii.medium,
    borderWidth: 1,
    borderColor: "transparent",
  },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.surface, borderColor: colors.border },
  ghost: { backgroundColor: "transparent" },
  danger: { backgroundColor: colors.dangerSoft },
  hovered: { opacity: 0.88 },
  focused: { borderColor: colors.primary, outlineStyle: "solid", outlineWidth: 3, outlineColor: colors.focusRing } as never,
  pressed: { opacity: 0.76, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.45 },
  label: { color: colors.text, fontSize: fontSizes.body, fontWeight: fontWeights.bold },
  primaryLabel: { color: colors.textInverse },
  dangerLabel: { color: colors.danger },
});
