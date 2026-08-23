import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useGetCustomers, useGetMenu, useGetOrders, type CustomerWithHistory, type MenuItem, type Order } from "@ody/api-client";
import { formatCurrency } from "@ody/shared";
import { Dialog, colors, fontSizes, fontWeights, radii, spacing } from "@ody/ui";
import { filterCustomers, filterMenuItems } from "@/lib/view-models";

const RESULT_LIMIT = 5;

export function GlobalSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const trimmed = query.trim();
  const hasQuery = trimmed.length > 0;

  const orders = useGetOrders({ search: trimmed || undefined }, { query: { enabled: open && hasQuery } });
  const menu = useGetMenu({ query: { enabled: open } });
  const customers = useGetCustomers({ query: { enabled: open } });

  const menuItems = useMemo(() => menu.data?.flatMap((category) => category.items) ?? [], [menu.data]);
  const orderResults = (orders.data ?? []).slice(0, RESULT_LIMIT);
  const menuResults = hasQuery ? filterMenuItems(menuItems, trimmed).slice(0, RESULT_LIMIT) : [];
  const customerResults = hasQuery ? filterCustomers(customers.data ?? [], trimmed).slice(0, RESULT_LIMIT) : [];
  const hasResults = orderResults.length > 0 || menuResults.length > 0 || customerResults.length > 0;

  const close = () => { setQuery(""); onClose(); };
  const goToOrders = (order: Order) => { router.push({ pathname: "/orders", params: { search: order.displayId } }); close(); };
  const goToMenu = () => { router.push("/menu"); close(); };
  const goToCustomer = (customer: CustomerWithHistory) => { router.push({ pathname: "/crm", params: { search: customer.name } }); close(); };

  return (
    <Dialog open={open} title="Search" description="Find orders, menu items, and customers." onClose={close}>
      <View style={styles.inputWrap}>
        <Ionicons name="search" size={17} color={colors.textMuted} />
        <TextInput
          autoFocus
          value={query}
          onChangeText={setQuery}
          placeholder="Order number, dish, or guest name"
          placeholderTextColor={colors.textSubtle}
          style={styles.input}
        />
      </View>

      {!hasQuery ? (
        <Text style={styles.hint}>Start typing to search across orders, the menu, and customers.</Text>
      ) : !hasResults ? (
        <Text style={styles.hint}>No matches for “{trimmed}”.</Text>
      ) : (
        <View style={styles.results}>
          {orderResults.length > 0 && (
            <ResultSection label="Orders">
              {orderResults.map((order) => (
                <ResultRow key={order.id} icon="receipt-outline" title={`${order.displayId} · ${order.customerName}`} subtitle={formatCurrency(order.total)} onPress={() => goToOrders(order)} />
              ))}
            </ResultSection>
          )}
          {menuResults.length > 0 && (
            <ResultSection label="Menu">
              {menuResults.map((item: MenuItem) => (
                <ResultRow key={item.id} icon="restaurant-outline" title={item.name} subtitle={formatCurrency(item.price)} onPress={goToMenu} />
              ))}
            </ResultSection>
          )}
          {customerResults.length > 0 && (
            <ResultSection label="Customers">
              {customerResults.map((customer) => (
                <ResultRow key={customer.id} icon="people-outline" title={customer.name} subtitle={customer.email} onPress={() => goToCustomer(customer)} />
              ))}
            </ResultSection>
          )}
        </View>
      )}
    </Dialog>
  );
}

function ResultSection({ label, children }: { label: string; children: React.ReactNode }) {
  return <View style={styles.section}><Text style={styles.sectionLabel}>{label}</Text>{children}</View>;
}

function ResultRow({ icon, title, subtitle, onPress }: { icon: keyof typeof Ionicons.glyphMap; title: string; subtitle: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ hovered, pressed }: any) => [styles.row, hovered && styles.rowHovered, pressed && styles.rowPressed]}>
      <View style={styles.rowIcon}><Ionicons name={icon} size={16} color={colors.textMuted} /></View>
      <View style={styles.rowCopy}>
        <Text numberOfLines={1} style={styles.rowTitle}>{title}</Text>
        <Text numberOfLines={1} style={styles.rowSubtitle}>{subtitle}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  inputWrap: { flexDirection: "row", alignItems: "center", gap: spacing[2], borderWidth: 1, borderColor: colors.border, borderRadius: radii.medium, paddingHorizontal: spacing[3], marginBottom: spacing[4] },
  input: { flex: 1, minHeight: 44, color: colors.text, fontSize: fontSizes.body, outlineStyle: "none" } as never,
  hint: { color: colors.textMuted, fontSize: fontSizes.body, paddingVertical: spacing[4], textAlign: "center" },
  results: { gap: spacing[4] },
  section: { gap: spacing[1] },
  sectionLabel: { color: colors.textSubtle, fontSize: 9, fontWeight: fontWeights.extraBold, textTransform: "uppercase", letterSpacing: 0.8, paddingHorizontal: spacing[2], marginBottom: spacing[1] },
  row: { flexDirection: "row", alignItems: "center", gap: spacing[3], paddingHorizontal: spacing[2], paddingVertical: spacing[2], borderRadius: radii.medium },
  rowHovered: { backgroundColor: colors.surfaceMuted },
  rowPressed: { opacity: 0.72 },
  rowIcon: { width: 32, height: 32, borderRadius: radii.medium, alignItems: "center", justifyContent: "center", backgroundColor: colors.surfaceMuted },
  rowCopy: { flex: 1, gap: 1 },
  rowTitle: { color: colors.text, fontSize: fontSizes.body, fontWeight: fontWeights.semibold },
  rowSubtitle: { color: colors.textMuted, fontSize: fontSizes.caption },
});
