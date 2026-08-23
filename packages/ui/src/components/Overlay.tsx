import type { PropsWithChildren } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fontSizes, fontWeights, radii, shadows, spacing } from "../tokens";

export function Dialog({ open, title, description, children, onClose }: PropsWithChildren<{ open: boolean; title: string; description?: string; onClose: () => void }>) {
  if (!open) return null;
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View accessibilityViewIsModal style={styles.backdrop}>
        <Pressable accessibilityLabel="Close dialog" style={StyleSheet.absoluteFill} onPress={onClose} />
        <View accessibilityRole="alert" style={styles.dialog}>
          <OverlayHeader title={title} description={description} onClose={onClose} />
          {children}
        </View>
      </View>
    </Modal>
  );
}

export function Drawer({ open, title, description, children, onClose }: PropsWithChildren<{ open: boolean; title: string; description?: string; onClose: () => void }>) {
  if (!open) return null;
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View accessibilityViewIsModal style={styles.backdrop}>
        <Pressable accessibilityLabel="Close drawer" style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.drawer}>
          <OverlayHeader title={title} description={description} onClose={onClose} />
          {children}
        </View>
      </View>
    </Modal>
  );
}

function OverlayHeader({ title, description, onClose }: { title: string; description?: string; onClose: () => void }) {
  return (
    <View style={styles.header}>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} style={(state) => [styles.close, (state as typeof state & { hovered?: boolean }).hovered && styles.closeHovered]}>
        <Text style={styles.closeLabel}>×</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, position: "fixed" as never, zIndex: 100, alignItems: "center", justifyContent: "center", padding: spacing[4], backgroundColor: "rgba(23, 23, 19, 0.38)" },
  dialog: { width: "100%", maxWidth: 520, maxHeight: "90%", backgroundColor: colors.surface, borderRadius: radii.extraLarge, padding: spacing[6], ...shadows.overlay },
  drawer: { position: "absolute", right: 0, top: 0, bottom: 0, width: "100%", maxWidth: 480, backgroundColor: colors.surface, padding: spacing[6], ...shadows.overlay },
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: spacing[4], marginBottom: spacing[5] }, copy: { flex: 1, gap: spacing[1] }, title: { color: colors.text, fontSize: fontSizes.heading2, fontWeight: fontWeights.extraBold }, description: { color: colors.textMuted, fontSize: fontSizes.body, lineHeight: 20 }, close: { width: 36, height: 36, borderRadius: radii.medium, alignItems: "center", justifyContent: "center" }, closeHovered: { backgroundColor: colors.surfaceMuted }, closeLabel: { color: colors.textMuted, fontSize: 25, lineHeight: 27 },
});
