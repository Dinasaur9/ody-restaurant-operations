import { Ionicons } from "@expo/vector-icons";
import { Link, usePathname } from "expo-router";
import type { PropsWithChildren } from "react";
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { colors, fontSizes, fontWeights, layout, radii, shadows, spacing } from "@ody/ui";
import { useGetDashboardSummary, useGetOrderingSettings } from "@ody/api-client";
import { getInitials } from "@ody/shared";

const navigation = [
  { label: "Home", href: "/home", icon: "grid-outline" },
  { label: "Orders", href: "/orders", icon: "receipt-outline" },
  { label: "Menu", href: "/menu", icon: "restaurant-outline" },
  { label: "CRM", href: "/crm", icon: "people-outline" },
  { label: "Settings", href: "/settings", icon: "settings-outline" },
] as const;

export function DashboardShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const compact = width < layout.breakpoints.tablet;
  const summary = useGetDashboardSummary();

  if (compact) {
    return (
      <View style={styles.app}>
        <MobileHeader />
        <ScrollView contentContainerStyle={styles.mobileContent}>{children}</ScrollView>
        <View style={styles.mobileNavigation}>
          {navigation.slice(0, 5).map((item) => (
            <NavLink key={item.href} item={item} active={pathname === item.href} compact />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.app}>
      <View style={styles.sidebar}>
        <Brand />
        <WorkspacePicker />
        <Text style={styles.navigationLabel}>Manage</Text>
        <View style={styles.navigation}>
          {navigation.map((item) => (
            <NavLink key={item.href} item={item} active={pathname === item.href} count={item.href === "/orders" ? summary.data?.totalOrders : undefined} />
          ))}
        </View>
        <View style={styles.sidebarSpacer} />
        <Link href="/ui-library" asChild>
          <Pressable style={({ pressed }) => [styles.libraryLink, pathname === "/ui-library" && styles.navActive, pressed && styles.pressed]}>
            <Ionicons name="color-palette-outline" size={19} color={colors.textMuted} />
            <Text style={styles.navText}>UI Library</Text>
          </Pressable>
        </Link>
        <Account />
      </View>
      <ScrollView style={styles.contentScroll} contentContainerStyle={styles.content}>{children}</ScrollView>
    </View>
  );
}

function Brand() {
  return <View style={styles.brand}><View style={styles.brandMark}><Text style={styles.brandMarkText}>o</Text></View><Text style={styles.brandName}>ody</Text></View>;
}

function MobileHeader() {
  return <View style={styles.mobileHeader}><Brand /><View style={styles.livePill}><View style={styles.liveDot} /><Text style={styles.liveText}>Service live</Text></View></View>;
}

function WorkspacePicker() {
  const settings = useGetOrderingSettings();
  const name = settings.data?.restaurantName ?? "Atelier Ody";
  const initials = getInitials(name) || "AO";

  return <Link href="/settings" asChild><Pressable accessibilityRole="button" accessibilityLabel={`Manage ${name} workspace`} style={({ hovered, pressed }: any) => [styles.workspace, hovered && styles.workspaceHovered, pressed && styles.pressed]}><View style={styles.workspaceAvatar}><Text style={styles.workspaceAvatarText}>{initials}</Text></View><View style={styles.workspaceCopy}><Text style={styles.workspaceEyebrow}>Workspace</Text><Text numberOfLines={1} style={styles.workspaceName}>{name}</Text></View><Ionicons name="settings-outline" size={16} color={colors.textMuted} /></Pressable></Link>;
}

function NavLink({ item, active, compact = false, count }: { item: (typeof navigation)[number]; active: boolean; compact?: boolean; count?: number }) {
  return <Link href={item.href} asChild><Pressable accessibilityRole="tab" accessibilityState={{ selected: active }} style={({ hovered, pressed }: any) => [compact ? styles.mobileNavItem : styles.navItem, active && (compact ? styles.mobileNavActive : styles.navActive), hovered && !active && styles.navHovered, pressed && styles.pressed]}><Ionicons name={item.icon} size={compact ? 21 : 19} color={active ? colors.primary : colors.textMuted} /><Text style={[compact ? styles.mobileNavText : styles.navText, active && styles.navTextActive]}>{item.label}</Text>{!compact && count !== undefined && count > 0 && <View style={styles.navCount}><Text style={styles.navCountText}>{count}</Text></View>}</Pressable></Link>;
}

function Account() {
  return <View style={styles.account}><View style={styles.accountAvatar}><Text style={styles.accountAvatarText}>DC</Text></View><View style={styles.accountCopy}><Text style={styles.accountName}>Dina Chen</Text><Text style={styles.accountRole}>Restaurant manager</Text></View><Ionicons name="ellipsis-horizontal" size={17} color={colors.textMuted} /></View>;
}

const styles = StyleSheet.create({
  app: { flex: 1, flexDirection: "row", minHeight: "100%", backgroundColor: colors.background },
  sidebar: { width: layout.sidebarWidth, height: "100%", backgroundColor: colors.surface, borderRightWidth: 1, borderRightColor: colors.border, paddingHorizontal: spacing[4], paddingVertical: spacing[5] },
  brand: { flexDirection: "row", alignItems: "center", gap: spacing[2], paddingHorizontal: spacing[2] },
  brandMark: { width: 31, height: 31, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: colors.primary, transform: [{ rotate: "-7deg" }] },
  brandMarkText: { color: colors.textInverse, fontSize: 21, lineHeight: 25, fontWeight: fontWeights.extraBold },
  brandName: { color: colors.text, fontSize: 25, fontWeight: fontWeights.extraBold, letterSpacing: -1.2 },
  workspace: { minHeight: 64, flexDirection: "row", alignItems: "center", gap: spacing[2], borderWidth: 1, borderColor: colors.border, borderRadius: radii.medium, padding: spacing[2], marginTop: spacing[6], marginBottom: spacing[6] },
  workspaceHovered: { borderColor: colors.borderStrong, backgroundColor: colors.backgroundSubtle },
  workspaceAvatar: { width: 36, height: 36, borderRadius: radii.medium, alignItems: "center", justifyContent: "center", backgroundColor: colors.accent },
  workspaceAvatarText: { color: colors.text, fontSize: fontSizes.micro, fontWeight: fontWeights.extraBold },
  workspaceCopy: { flex: 1, gap: 2 }, workspaceEyebrow: { color: colors.textSubtle, fontSize: 9, fontWeight: fontWeights.extraBold, textTransform: "uppercase", letterSpacing: .7 }, workspaceName: { color: colors.text, fontSize: fontSizes.caption, fontWeight: fontWeights.bold },
  navigationLabel: { color: colors.textSubtle, fontSize: 9, fontWeight: fontWeights.extraBold, textTransform: "uppercase", letterSpacing: .8, paddingHorizontal: spacing[3], marginBottom: spacing[2] }, navigation: { gap: spacing[1] },
  navItem: { minHeight: 43, flexDirection: "row", alignItems: "center", gap: spacing[3], paddingHorizontal: spacing[3], borderRadius: radii.medium }, navActive: { backgroundColor: colors.primarySoft }, navHovered: { backgroundColor: colors.surfaceMuted }, pressed: { opacity: .72 }, navText: { flex: 1, color: colors.textMuted, fontSize: fontSizes.body, fontWeight: fontWeights.semibold }, navTextActive: { color: colors.primary, fontWeight: fontWeights.bold }, navCount: { minWidth: 22, alignItems: "center", paddingHorizontal: 6, paddingVertical: 2, borderRadius: radii.pill, backgroundColor: colors.accent }, navCountText: { color: colors.text, fontSize: fontSizes.micro, fontWeight: fontWeights.extraBold },
  sidebarSpacer: { flex: 1 }, libraryLink: { minHeight: 43, flexDirection: "row", alignItems: "center", gap: spacing[3], paddingHorizontal: spacing[3], borderRadius: radii.medium },
  account: { flexDirection: "row", alignItems: "center", gap: spacing[2], borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing[4], marginTop: spacing[3] }, accountAvatar: { width: 36, height: 36, borderRadius: radii.medium, alignItems: "center", justifyContent: "center", backgroundColor: colors.surfaceStrong }, accountAvatarText: { color: colors.textInverse, fontSize: fontSizes.micro, fontWeight: fontWeights.extraBold }, accountCopy: { flex: 1, gap: 1 }, accountName: { color: colors.text, fontSize: fontSizes.caption, fontWeight: fontWeights.bold }, accountRole: { color: colors.textSubtle, fontSize: fontSizes.micro },
  contentScroll: { flex: 1 }, content: { width: "100%", maxWidth: layout.contentMaxWidth, alignSelf: "center", padding: layout.pageGutterDesktop, paddingBottom: spacing[16] },
  mobileHeader: { height: 64, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing[4], backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }, livePill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: spacing[3], paddingVertical: 7, borderRadius: radii.pill, backgroundColor: colors.successSoft }, liveDot: { width: 7, height: 7, borderRadius: radii.pill, backgroundColor: colors.success }, liveText: { color: colors.success, fontSize: fontSizes.micro, fontWeight: fontWeights.bold }, mobileContent: { padding: layout.pageGutterMobile, paddingBottom: 100 },
  mobileNavigation: { position: "fixed" as never, zIndex: 50, left: 0, right: 0, bottom: 0, minHeight: 68, flexDirection: "row", alignItems: "center", justifyContent: "space-around", paddingHorizontal: spacing[2], paddingBottom: 4, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, ...shadows.card }, mobileNavItem: { minWidth: 58, minHeight: 55, alignItems: "center", justifyContent: "center", gap: 3, borderRadius: radii.medium }, mobileNavActive: { backgroundColor: colors.primarySoft }, mobileNavText: { color: colors.textMuted, fontSize: 9, fontWeight: fontWeights.semibold },
});
