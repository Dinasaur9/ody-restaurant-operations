import type { PropsWithChildren, ReactNode } from "react";
import { StyleSheet, Text, View, type ViewProps } from "react-native";
import { colors, fontSizes, fontWeights, radii, shadows, spacing } from "../tokens";

export interface CardProps extends ViewProps {
  title?: string;
  description?: string;
  action?: ReactNode;
}

export function Card({ children, title, description, action, style, ...props }: PropsWithChildren<CardProps>) {
  return (
    <View {...props} style={[styles.card, style]}>
      {(title || description || action) && (
        <View style={styles.header}>
          <View style={styles.headingCopy}>
            {title && <Text style={styles.title}>{title}</Text>}
            {description && <Text style={styles.description}>{description}</Text>}
          </View>
          {action}
        </View>
      )}
      {children}
    </View>
  );
}

export function Divider() {
  return <View accessibilityRole="none" style={styles.divider} />;
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.large, padding: spacing[5], ...shadows.card },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: spacing[4], marginBottom: spacing[4] },
  headingCopy: { flex: 1, gap: spacing[1] },
  title: { color: colors.text, fontSize: fontSizes.heading3, fontWeight: fontWeights.bold },
  description: { color: colors.textMuted, fontSize: fontSizes.caption, lineHeight: 18 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing[4] },
});
