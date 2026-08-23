import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { Button, Card, Divider, Field, InlineMessage, Skeleton, Toast, Toggle, colors, fontSizes, fontWeights, radii, spacing } from "@ody/ui";
import { PageScaffold } from "@/components/PageScaffold";
import { QueryError } from "@/components/OperationalStates";
import { useSettingsOperations } from "@/hooks/useSettingsOperations";

export default function SettingsPage() {
  const operations = useSettingsOperations();
  return <PageScaffold eyebrow="Workspace" title="Settings" description="Configure how Atelier Ody accepts and prepares online orders." action={<Button loading={operations.pending} onPress={operations.save}>Save changes</Button>}>
    {operations.settings.isPending ? <View style={styles.loading}><Skeleton height={220} /><Skeleton height={260} /></View> : operations.settings.isError ? <QueryError title="Settings couldn’t be loaded" onRetry={() => operations.settings.refetch()} /> : <View style={styles.columns}>
      <View style={styles.mainColumn}>
        <Card title="Restaurant profile" description="Shown across your operations workspace and ordering surfaces."><View style={styles.form}><Field label="Restaurant name" required value={operations.form.restaurantName} onChangeText={(value) => operations.setField("restaurantName", value)} /><View style={styles.brandPreview}><View style={styles.brandIcon}><Text style={styles.brandIconText}>AO</Text></View><View><Text style={styles.previewLabel}>Workspace preview</Text><Text style={styles.previewName}>{operations.form.restaurantName || "Your restaurant"}</Text></View></View></View></Card>
        <Card title="Service hours" description="Define when guests can submit online orders." style={styles.cardGap}><View style={styles.fieldRow}><View style={styles.fieldHalf}><Field label="Opening time" required value={operations.form.openingTime} onChangeText={(value) => operations.setField("openingTime", value)} placeholder="09:00" /></View><View style={styles.fieldHalf}><Field label="Closing time" required value={operations.form.closingTime} onChangeText={(value) => operations.setField("closingTime", value)} placeholder="22:00" /></View></View><Divider /><View style={styles.hoursSummary}><Ionicons name="time-outline" size={20} color={colors.primary} /><Text style={styles.hoursText}>Orders accepted from <Text style={styles.hoursStrong}>{operations.form.openingTime}</Text> to <Text style={styles.hoursStrong}>{operations.form.closingTime}</Text></Text></View></Card>
      </View>
      <View style={styles.sideColumn}>
        <Card title="Ordering controls" description="Changes take effect as soon as you save."><Toggle label="Online ordering" description="Allow guests and staff to create new orders." value={operations.form.serviceEnabled ?? true} onChange={(value) => operations.setField("serviceEnabled", value)} /><Divider /><Toggle label="Auto-accept orders" description="Skip manual acceptance and send orders directly to the queue." value={operations.form.autoAcceptOrders ?? false} onChange={(value) => operations.setField("autoAcceptOrders", value)} /><Divider /><Field label="Default preparation time" value={String(operations.form.prepTimeMinutes)} onChangeText={(value) => operations.setField("prepTimeMinutes", Number(value) || 0)} keyboardType="number-pad" hint="Between 5 and 120 minutes" /></Card>
        <InlineMessage tone={operations.form.serviceEnabled ? "success" : "warning"} title={operations.form.serviceEnabled ? "Ordering is live" : "Ordering is paused"}>{operations.form.serviceEnabled ? "New orders can be submitted during your service hours." : "New order requests will be rejected by the backend."}</InlineMessage>
        {Boolean(operations.error) && <InlineMessage tone="error" title="Settings weren’t saved">Check that closing time is later than opening time and prep time is valid.</InlineMessage>}
      </View>
    </View>}
    <Toast message={operations.saved} />
  </PageScaffold>;
}

const styles = StyleSheet.create({
  loading: { gap: spacing[4] }, columns: { flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", gap: spacing[5] }, mainColumn: { flex: 1.6, minWidth: 410 }, sideColumn: { flex: 1, minWidth: 310, gap: spacing[4] }, form: { gap: spacing[5] }, cardGap: { marginTop: spacing[5] }, fieldRow: { flexDirection: "row", gap: spacing[3] }, fieldHalf: { flex: 1 }, brandPreview: { minHeight: 68, flexDirection: "row", alignItems: "center", gap: spacing[3], padding: spacing[3], borderRadius: radii.medium, backgroundColor: colors.backgroundSubtle }, brandIcon: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: radii.medium, backgroundColor: colors.accent }, brandIconText: { color: colors.text, fontSize: fontSizes.caption, fontWeight: fontWeights.extraBold }, previewLabel: { color: colors.textSubtle, fontSize: fontSizes.micro, textTransform: "uppercase", letterSpacing: .5 }, previewName: { color: colors.text, fontSize: fontSizes.body, fontWeight: fontWeights.bold, marginTop: 2 }, hoursSummary: { flexDirection: "row", alignItems: "center", gap: spacing[3], padding: spacing[3], borderRadius: radii.medium, backgroundColor: colors.primarySoft }, hoursText: { color: colors.textMuted, fontSize: fontSizes.caption }, hoursStrong: { color: colors.primary, fontWeight: fontWeights.bold },
});
