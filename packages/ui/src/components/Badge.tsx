import type { PropsWithChildren } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, fontSizes, fontWeights, radii, spacing } from "../tokens";

export type BadgeTone = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

export function Badge({ children, tone = "neutral", dot = false }: PropsWithChildren<{ tone?: BadgeTone; dot?: boolean }>) {
  return (
    <View style={[styles.badge, styles[`${tone}Background`]]}>
      {dot && <View style={[styles.dot, styles[`${tone}Foreground`]]} />}
      <Text style={[styles.label, styles[`${tone}Text`]]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: spacing[1], paddingHorizontal: spacing[2], paddingVertical: 5, borderRadius: radii.pill },
  label: { fontSize: fontSizes.micro, fontWeight: fontWeights.extraBold, textTransform: "uppercase", letterSpacing: 0.45 },
  dot: { width: 6, height: 6, borderRadius: radii.pill },
  neutralBackground: { backgroundColor: colors.surfaceMuted }, primaryBackground: { backgroundColor: colors.primarySoft }, successBackground: { backgroundColor: colors.successSoft }, warningBackground: { backgroundColor: colors.warningSoft }, dangerBackground: { backgroundColor: colors.dangerSoft }, infoBackground: { backgroundColor: colors.infoSoft },
  neutralText: { color: colors.textMuted }, primaryText: { color: colors.primary }, successText: { color: colors.success }, warningText: { color: colors.warning }, dangerText: { color: colors.danger }, infoText: { color: colors.info },
  neutralForeground: { backgroundColor: colors.textMuted }, primaryForeground: { backgroundColor: colors.primary }, successForeground: { backgroundColor: colors.success }, warningForeground: { backgroundColor: colors.warning }, dangerForeground: { backgroundColor: colors.danger }, infoForeground: { backgroundColor: colors.info },
});
