import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Button, colors, fontSizes, fontWeights, spacing } from "@ody/ui";

export default function NotFound() {
  return (
    <View style={styles.page}>
      <Stack.Screen options={{ title: "Not found" }} />
      <Text style={styles.code}>404</Text>
      <Text style={styles.title}>This page isn’t on the menu.</Text>
      <Text style={styles.body}>Return to the restaurant overview to keep service moving.</Text>
      <Link href="/home" asChild>
        <Button>Back to Home</Button>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing[6], backgroundColor: colors.background, gap: spacing[3] },
  code: { color: colors.primary, fontSize: 14, fontWeight: fontWeights.extraBold, letterSpacing: 1 },
  title: { color: colors.text, fontSize: fontSizes.heading1, fontWeight: fontWeights.extraBold, textAlign: "center" },
  body: { color: colors.textMuted, fontSize: fontSizes.body, textAlign: "center", marginBottom: spacing[3] },
});
