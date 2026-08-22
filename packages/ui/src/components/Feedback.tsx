import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "./Button";
import { colors, fontSizes, fontWeights, radii, shadows, spacing } from "../tokens";

export function Skeleton({ width = "100%", height = 16, radius = radii.small }: { width?: number | `${number}%`; height?: number; radius?: number }) {
  return <View accessibilityLabel="Loading" style={[styles.skeleton, { width, height, borderRadius: radius }]} />;
}

export function EmptyState({ icon = "✦", title, description, actionLabel, onAction }: { icon?: string; title: string; description: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}><Text style={styles.emptyIconText}>{icon}</Text></View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
      {actionLabel && onAction && <Button variant="secondary" onPress={onAction}>{actionLabel}</Button>}
    </View>
  );
}

export function InlineMessage({ tone = "info", title, children }: { tone?: "info" | "success" | "warning" | "error"; title: string; children?: ReactNode }) {
  const palette = toneStyles[tone];
  return <View accessibilityRole="alert" style={[styles.message, { backgroundColor: palette.background }]}><View style={[styles.messageDot, { backgroundColor: palette.foreground }]} /><View style={{ flex: 1 }}><Text style={[styles.messageTitle, { color: palette.foreground }]}>{title}</Text>{children && <Text style={styles.messageBody}>{children}</Text>}</View></View>;
}

export function Toast({ message, tone = "success" }: { message?: string; tone?: "success" | "error" }) {
  if (!message) return null;
  return <View accessibilityRole="alert" style={[styles.toast, tone === "error" && { backgroundColor: colors.danger }]}><Text style={styles.toastText}>{tone === "success" ? "✓" : "!"}  {message}</Text></View>;
}

const toneStyles = {
  info: { foreground: colors.info, background: colors.infoSoft }, success: { foreground: colors.success, background: colors.successSoft }, warning: { foreground: colors.warning, background: colors.warningSoft }, error: { foreground: colors.danger, background: colors.dangerSoft },
};
const styles = StyleSheet.create({
  skeleton: { backgroundColor: colors.surfaceMuted }, empty: { alignItems: "center", padding: spacing[10], gap: spacing[2] }, emptyIcon: { width: 46, height: 46, borderRadius: radii.large, alignItems: "center", justifyContent: "center", backgroundColor: colors.primarySoft, marginBottom: spacing[2] }, emptyIconText: { color: colors.primary, fontSize: 23 }, emptyTitle: { color: colors.text, fontSize: fontSizes.heading3, fontWeight: fontWeights.bold }, emptyDescription: { color: colors.textMuted, fontSize: fontSizes.body, lineHeight: 21, textAlign: "center", maxWidth: 340, marginBottom: spacing[2] }, message: { flexDirection: "row", gap: spacing[3], borderRadius: radii.medium, padding: spacing[4] }, messageDot: { width: 8, height: 8, borderRadius: radii.pill, marginTop: 5 }, messageTitle: { fontSize: fontSizes.body, fontWeight: fontWeights.bold }, messageBody: { color: colors.textMuted, fontSize: fontSizes.caption, lineHeight: 18, marginTop: 2 }, toast: { position: "fixed" as never, zIndex: 120, right: spacing[6], bottom: spacing[6], paddingHorizontal: spacing[4], paddingVertical: spacing[3], borderRadius: radii.medium, backgroundColor: colors.success, ...shadows.overlay }, toastText: { color: colors.textInverse, fontSize: fontSizes.body, fontWeight: fontWeights.bold },
});
