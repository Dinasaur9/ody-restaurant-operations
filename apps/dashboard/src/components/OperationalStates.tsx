import { StyleSheet, Text, View } from "react-native";
import { Button, Card, EmptyState, Skeleton, colors, fontSizes, fontWeights, spacing } from "@ody/ui";

export function CardGridSkeleton({ count = 4 }: { count?: number }) {
  return <View style={styles.grid}>{Array.from({ length: count }, (_, index) => <Card key={index} style={styles.skeletonCard}><Skeleton width="44%" height={12} /><Skeleton width="58%" height={30} /><Skeleton width="76%" height={11} /></Card>)}</View>;
}

export function QueryError({ title = "We couldn’t load this view", onRetry }: { title?: string; onRetry: () => void }) {
  return <Card><EmptyState icon="!" title={title} description="The API may still be starting. Check the backend connection and try again." actionLabel="Try again" onAction={onRetry} /></Card>;
}

export function SectionHeading({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return <View style={styles.sectionHeading}><View><Text style={styles.title}>{title}</Text>{description && <Text style={styles.description}>{description}</Text>}</View>{action}</View>;
}

export function RefreshButton({ onPress }: { onPress: () => void }) { return <Button variant="ghost" onPress={onPress}>Refresh</Button>; }

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing[4] }, skeletonCard: { flex: 1, minWidth: 190, gap: spacing[4] }, sectionHeading: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: spacing[4], marginTop: spacing[8], marginBottom: spacing[4] }, title: { color: colors.text, fontSize: fontSizes.heading2, fontWeight: fontWeights.extraBold }, description: { color: colors.textMuted, fontSize: fontSizes.caption, marginTop: spacing[1] },
});
