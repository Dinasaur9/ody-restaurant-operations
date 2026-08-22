import type { PropsWithChildren, ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fontSizes, fontWeights, spacing } from "../tokens";

export function DataList({ children }: PropsWithChildren) { return <View style={styles.list}>{children}</View>; }

export function DataListHeader({ columns }: { columns: readonly { label: string; width?: number; flex?: number }[] }) {
  return <View style={styles.header}>{columns.map((column) => <Text key={column.label} style={[styles.headerText, { width: column.width, flex: column.flex }]}>{column.label}</Text>)}</View>;
}

export function DataListRow({ children, onPress, label }: PropsWithChildren<{ onPress?: () => void; label?: string }>) {
  const content = <View style={styles.row}>{children}</View>;
  return onPress ? <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={(state) => [(state as typeof state & { hovered?: boolean }).hovered && styles.hovered, state.pressed && styles.pressed]}>{content}</Pressable> : content;
}

export function DataListCell({ children, width, flex = 1, align = "left" }: PropsWithChildren<{ width?: number; flex?: number; align?: "left" | "right" }>) {
  return <View style={{ width, flex, alignItems: align === "right" ? "flex-end" : "flex-start" }}>{typeof children === "string" ? <Text numberOfLines={1} style={styles.cellText}>{children}</Text> : children as ReactNode}</View>;
}

const styles = StyleSheet.create({
  list: { width: "100%" }, header: { minHeight: 38, flexDirection: "row", alignItems: "center", gap: spacing[3], paddingHorizontal: spacing[3], borderBottomWidth: 1, borderColor: colors.border }, headerText: { color: colors.textSubtle, fontSize: fontSizes.micro, fontWeight: fontWeights.extraBold, textTransform: "uppercase", letterSpacing: .5 }, row: { minHeight: 64, flexDirection: "row", alignItems: "center", gap: spacing[3], paddingHorizontal: spacing[3], borderBottomWidth: 1, borderColor: colors.border }, hovered: { backgroundColor: colors.backgroundSubtle }, pressed: { opacity: .72 }, cellText: { color: colors.text, fontSize: fontSizes.body },
});
