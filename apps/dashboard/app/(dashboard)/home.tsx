import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useGetDashboardSummary } from "@ody/api-client";
import { formatCurrency, formatRelativeTime } from "@ody/shared";
import { Badge, Card, DataList, DataListCell, DataListHeader, DataListRow, colors, fontSizes, fontWeights, radii, spacing } from "@ody/ui";
import { CHANNEL_LABELS, STATUS_LABELS, type OrderStatus } from "@ody/types";
import { PageScaffold } from "@/components/PageScaffold";
import { CardGridSkeleton, QueryError, RefreshButton, SectionHeading } from "@/components/OperationalStates";

const statusTone = (status: string) => status === "completed" ? "success" : status === "cancelled" ? "danger" : status === "pending" ? "warning" : "primary";

export default function HomePage() {
  const summary = useGetDashboardSummary();
  return <PageScaffold eyebrow="Today at a glance" title="Good afternoon, Dina" description="Live performance and kitchen activity across Atelier Ody.">
    {summary.isPending ? <CardGridSkeleton /> : summary.isError ? <QueryError onRetry={() => summary.refetch()} /> : summary.data && <>
      <View style={styles.metrics}>
        <Metric label="Revenue" value={formatCurrency(summary.data.revenue)} detail="Across non-cancelled orders" icon="wallet-outline" tone="violet" />
        <Metric label="Total orders" value={String(summary.data.totalOrders)} detail={`${summary.data.activeOrders} active now`} icon="receipt-outline" tone="lime" />
        <Metric label="Average order" value={formatCurrency(summary.data.averageOrder)} detail="Excluding cancellations" icon="trending-up-outline" tone="blue" />
        <Metric label="Customers" value={String(summary.data.customers)} detail={`${summary.data.pendingOrders} awaiting acceptance`} icon="people-outline" tone="orange" />
      </View>
      <View style={styles.twoColumns}>
        <View style={styles.mainColumn}>
          <SectionHeading title="Recent orders" description="Latest activity across every channel" action={<Link href="/orders" asChild><Pressable><Text style={styles.link}>View all  →</Text></Pressable></Link>} />
          <Card style={styles.tableCard}><DataList><DataListHeader columns={[{ label: "Order", flex: 1 }, { label: "Customer", flex: 1.5 }, { label: "Status", flex: 1 }, { label: "Total", flex: 1 }]} />
            {summary.data.recentOrders.map((order) => <DataListRow key={order.id}><DataListCell><View><Text style={styles.orderId}>{order.displayId}</Text><Text style={styles.muted}>{formatRelativeTime(order.createdAt)}</Text></View></DataListCell><DataListCell flex={1.5}><View><Text style={styles.cellStrong}>{order.customerName}</Text><Text style={styles.muted}>{CHANNEL_LABELS[order.channel]}</Text></View></DataListCell><DataListCell><Badge tone={statusTone(order.status)} dot>{STATUS_LABELS[order.status as OrderStatus]}</Badge></DataListCell><DataListCell><Text style={styles.amount}>{formatCurrency(order.total)}</Text></DataListCell></DataListRow>)}
          </DataList></Card>
        </View>
        <View style={styles.sideColumn}>
          <SectionHeading title="Popular items" description="Top sellers by quantity" action={<RefreshButton onPress={() => summary.refetch()} />} />
          <Card style={styles.popularCard}>{summary.data.popularItems.map((item, index) => <View key={item.name} style={[styles.popularRow, index < summary.data.popularItems.length - 1 && styles.rowBorder]}><View style={styles.rank}><Text style={styles.rankText}>{index + 1}</Text></View><View style={styles.itemCopy}><Text style={styles.itemName}>{item.name}</Text><Text style={styles.muted}>{item.quantity} items sold</Text></View><Text style={styles.amount}>{formatCurrency(item.revenue)}</Text></View>)}</Card>
          <Card style={styles.liveCard}><View style={styles.liveTop}><View style={styles.liveIcon}><Ionicons name="radio-outline" size={20} color={colors.success} /></View><Badge tone="success" dot>Live</Badge></View><Text style={styles.liveTitle}>Service is running smoothly</Text><Text style={styles.liveBody}>{summary.data.activeOrders} orders are moving through the kitchen right now.</Text></Card>
        </View>
      </View>
    </>}
  </PageScaffold>;
}

function Metric({ label, value, detail, icon, tone }: { label: string; value: string; detail: string; icon: keyof typeof Ionicons.glyphMap; tone: "violet" | "lime" | "blue" | "orange" }) {
  return <Card style={styles.metric}><View style={styles.metricTop}><Text style={styles.metricLabel}>{label}</Text><View style={[styles.metricIcon, styles[`${tone}Icon`]]}><Ionicons name={icon} size={19} color={tone === "violet" ? colors.primary : tone === "lime" ? colors.text : tone === "blue" ? colors.info : colors.warning} /></View></View><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricDetail}>{detail}</Text></Card>;
}

const styles = StyleSheet.create({
  metrics: { flexDirection: "row", flexWrap: "wrap", gap: spacing[4] }, metric: { flex: 1, minWidth: 190, gap: spacing[2] }, metricTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, metricLabel: { color: colors.textMuted, fontSize: fontSizes.caption, fontWeight: fontWeights.bold }, metricIcon: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderRadius: radii.medium }, violetIcon: { backgroundColor: colors.primarySoft }, limeIcon: { backgroundColor: colors.accent }, blueIcon: { backgroundColor: colors.infoSoft }, orangeIcon: { backgroundColor: colors.warningSoft }, metricValue: { color: colors.text, fontSize: 28, lineHeight: 34, fontWeight: fontWeights.extraBold, letterSpacing: -.6 }, metricDetail: { color: colors.textMuted, fontSize: fontSizes.micro },
  twoColumns: { flexDirection: "row", flexWrap: "wrap", gap: spacing[5] }, mainColumn: { flex: 2, minWidth: 520 }, sideColumn: { flex: 1, minWidth: 290 }, tableCard: { padding: 0, overflow: "hidden" }, link: { color: colors.primary, fontSize: fontSizes.caption, fontWeight: fontWeights.bold }, orderId: { color: colors.primary, fontSize: fontSizes.body, fontWeight: fontWeights.bold }, cellStrong: { color: colors.text, fontSize: fontSizes.body, fontWeight: fontWeights.semibold }, muted: { color: colors.textMuted, fontSize: fontSizes.micro, marginTop: 2 }, amount: { color: colors.text, fontSize: fontSizes.body, fontWeight: fontWeights.bold }, popularCard: { paddingVertical: 0 }, popularRow: { minHeight: 70, flexDirection: "row", alignItems: "center", gap: spacing[3] }, rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border }, rank: { width: 30, height: 30, alignItems: "center", justifyContent: "center", borderRadius: radii.small, backgroundColor: colors.surfaceMuted }, rankText: { color: colors.textMuted, fontSize: fontSizes.caption, fontWeight: fontWeights.extraBold }, itemCopy: { flex: 1 }, itemName: { color: colors.text, fontSize: fontSizes.caption, fontWeight: fontWeights.bold }, liveCard: { marginTop: spacing[4], backgroundColor: colors.successSoft, borderColor: "transparent" }, liveTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, liveIcon: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderRadius: radii.medium, backgroundColor: colors.surface }, liveTitle: { color: colors.text, fontSize: fontSizes.bodyLarge, fontWeight: fontWeights.extraBold, marginTop: spacing[4] }, liveBody: { color: colors.textMuted, fontSize: fontSizes.caption, lineHeight: 18, marginTop: spacing[1] },
});
