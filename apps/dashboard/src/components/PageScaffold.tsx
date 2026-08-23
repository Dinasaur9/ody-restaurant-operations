import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import type { PropsWithChildren, ReactNode } from "react";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { GetOrdersStatus, useGetDashboardSummary, useGetOrders } from "@ody/api-client";
import { formatRelativeTime } from "@ody/shared";
import { Card, colors, fontSizes, fontWeights, radii, shadows, spacing } from "@ody/ui";
import { GlobalSearch } from "@/components/GlobalSearch";

export function PageScaffold({ title, eyebrow, description, action, children }: PropsWithChildren<{ title: string; eyebrow: string; description: string; action?: ReactNode }>) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const summary = useGetDashboardSummary();
  const hasPending = Boolean(summary.data && summary.data.pendingOrders > 0);

  return (
    <View>
      <View style={styles.header}>
        <View style={styles.copy}>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
        <View style={styles.actions}>
          <Pressable accessibilityRole="button" accessibilityLabel="Search" onPress={() => setSearchOpen(true)} style={({ hovered, pressed }: any) => [styles.iconButton, hovered && styles.iconButtonHovered, pressed && styles.iconButtonPressed]}>
            <Ionicons name="search" size={19} color={colors.textMuted} />
          </Pressable>
          <View style={styles.notificationsAnchor}>
            <Pressable accessibilityRole="button" accessibilityLabel="Notifications" onPress={() => setNotificationsOpen((current) => !current)} style={({ hovered, pressed }: any) => [styles.iconButton, hovered && styles.iconButtonHovered, pressed && styles.iconButtonPressed]}>
              <Ionicons name="notifications-outline" size={19} color={colors.textMuted} />
              {hasPending && <View style={styles.notificationDot} />}
            </Pressable>
            {notificationsOpen && <NotificationsPanel pendingCount={summary.data?.pendingOrders ?? 0} onClose={() => setNotificationsOpen(false)} />}
          </View>
          {action}
        </View>
      </View>
      {children ?? <Card><Text style={styles.placeholderTitle}>Ready for service</Text><Text style={styles.placeholderBody}>This product area will be connected to the generated API client in its dedicated milestone.</Text></Card>}
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </View>
  );
}

function NotificationsPanel({ pendingCount, onClose }: { pendingCount: number; onClose: () => void }) {
  const router = useRouter();
  const pending = useGetOrders({ status: GetOrdersStatus.pending }, { query: { enabled: true } });
  const orders = (pending.data ?? []).slice(0, 5);

  const openOrder = (displayId: string) => {
    router.push({ pathname: "/orders", params: { search: displayId } });
    onClose();
  };
  const viewAll = () => {
    router.push({ pathname: "/orders", params: { status: GetOrdersStatus.pending } });
    onClose();
  };

  return (
    <>
      <Pressable accessibilityLabel="Close notifications" style={styles.scrim} onPress={onClose} />
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>{pendingCount > 0 ? `${pendingCount} order${pendingCount === 1 ? "" : "s"} awaiting acceptance` : "You’re all caught up"}</Text>
        {orders.length === 0 ? (
          <Text style={styles.panelEmpty}>No orders are waiting on you right now.</Text>
        ) : (
          <ScrollView style={styles.panelList}>
            {orders.map((order) => (
              <Pressable key={order.id} accessibilityRole="button" onPress={() => openOrder(order.displayId)} style={({ hovered, pressed }: any) => [styles.panelRow, hovered && styles.panelRowHovered, pressed && styles.panelRowPressed]}>
                <View style={styles.panelDot} />
                <View style={styles.panelRowCopy}>
                  <Text style={styles.panelRowTitle}>{order.displayId} · {order.customerName}</Text>
                  <Text style={styles.panelRowSubtitle}>{formatRelativeTime(order.createdAt)}</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        )}
        {orders.length > 0 && (
          <Pressable accessibilityRole="button" onPress={viewAll} style={({ pressed }: any) => [styles.panelFooter, pressed && styles.panelRowPressed]}>
            <Text style={styles.panelFooterText}>View all pending orders</Text>
          </Pressable>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: spacing[6], marginBottom: spacing[6], zIndex: 10 },
  copy: { flex: 1, maxWidth: 680 },
  eyebrow: { color: colors.primary, fontSize: fontSizes.micro, fontWeight: fontWeights.extraBold, textTransform: "uppercase", letterSpacing: 1, marginBottom: spacing[1] },
  title: { color: colors.text, fontSize: fontSizes.display, lineHeight: 43, fontWeight: fontWeights.extraBold, letterSpacing: -1 },
  description: { color: colors.textMuted, fontSize: fontSizes.body, lineHeight: 21, marginTop: spacing[2] },
  actions: { flexDirection: "row", alignItems: "center", gap: spacing[2] },
  iconButton: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border, borderRadius: radii.medium, backgroundColor: colors.surface },
  iconButtonHovered: { backgroundColor: colors.surfaceMuted },
  iconButtonPressed: { opacity: 0.72 },
  notificationDot: { position: "absolute", top: 8, right: 9, width: 7, height: 7, borderRadius: radii.pill, backgroundColor: colors.danger, borderWidth: 1, borderColor: colors.surface },
  notificationsAnchor: { position: "relative" },
  scrim: { ...StyleSheet.absoluteFillObject, position: "fixed" as never, zIndex: 40 },
  panel: { position: "absolute", zIndex: 50, top: 50, right: 0, width: 320, maxHeight: 380, borderWidth: 1, borderColor: colors.border, borderRadius: radii.large, backgroundColor: colors.surface, padding: spacing[3], ...shadows.overlay },
  panelTitle: { color: colors.text, fontSize: fontSizes.caption, fontWeight: fontWeights.bold, paddingHorizontal: spacing[2], marginBottom: spacing[2] },
  panelEmpty: { color: colors.textMuted, fontSize: fontSizes.caption, paddingHorizontal: spacing[2], paddingVertical: spacing[3] },
  panelList: { maxHeight: 260 },
  panelRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing[2], paddingHorizontal: spacing[2], paddingVertical: spacing[2], borderRadius: radii.medium },
  panelRowHovered: { backgroundColor: colors.surfaceMuted },
  panelRowPressed: { opacity: 0.72 },
  panelDot: { width: 6, height: 6, borderRadius: radii.pill, backgroundColor: colors.warning, marginTop: 6 },
  panelRowCopy: { flex: 1, gap: 1 },
  panelRowTitle: { color: colors.text, fontSize: fontSizes.caption, fontWeight: fontWeights.semibold },
  panelRowSubtitle: { color: colors.textMuted, fontSize: fontSizes.micro },
  panelFooter: { alignItems: "center", paddingVertical: spacing[3], marginTop: spacing[1], borderTopWidth: 1, borderTopColor: colors.border },
  panelFooterText: { color: colors.primary, fontSize: fontSizes.caption, fontWeight: fontWeights.bold },
  placeholderTitle: { color: colors.text, fontSize: fontSizes.heading3, fontWeight: fontWeights.bold },
  placeholderBody: { color: colors.textMuted, fontSize: fontSizes.body, marginTop: spacing[2] },
});
