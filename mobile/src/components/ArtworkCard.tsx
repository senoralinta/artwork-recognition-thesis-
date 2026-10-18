import { Ionicons } from "@expo/vector-icons";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

import type { ArtworkDetail } from "../api/types";
import { useI18n } from "../i18n";
import { colors, fonts, spacing } from "../theme";

function Fact({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) {
    return null;
  }
  return (
    <View style={styles.fact}>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue}>{value}</Text>
    </View>
  );
}

// Wall-label style presentation of one artwork: title, artist, facts, description, source.
export default function ArtworkCard({ artwork }: { artwork: ArtworkDetail }) {
  const { t, lang } = useI18n();
  const description = lang === "tr" ? artwork.description_tr : artwork.description_en;

  return (
    <View>
      <Text style={styles.title}>{artwork.title}</Text>
      {artwork.artist ? <Text style={styles.artist}>{artwork.artist}</Text> : null}

      <View style={styles.rule} />

      <Fact label={t.result.year} value={artwork.year} />
      <Fact label={t.result.type} value={artwork.type} />
      <Fact label={t.result.museum} value={artwork.museum} />

      {description ? <Text style={styles.description}>{description}</Text> : null}

      {artwork.source_url ? (
        <Pressable
          style={styles.source}
          onPress={() => Linking.openURL(artwork.source_url as string)}
          accessibilityRole="link"
        >
          <Ionicons name="open-outline" size={18} color={colors.primary} />
          <Text style={styles.sourceText}>{t.result.source}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.title, fontSize: 28, lineHeight: 34, color: colors.text },
  artist: {
    fontFamily: fonts.italic,
    fontSize: 18,
    lineHeight: 24,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  rule: {
    height: 2,
    width: 40,
    backgroundColor: colors.accent,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  fact: {
    flexDirection: "row",
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  factLabel: { width: 90, color: colors.muted, fontSize: 14 },
  factValue: { flex: 1, color: colors.text, fontSize: 15 },
  description: {
    fontFamily: fonts.text,
    fontSize: 17,
    lineHeight: 27,
    color: colors.text,
    marginTop: spacing.lg,
  },
  source: { flexDirection: "row", alignItems: "center", marginTop: spacing.lg, minHeight: 44 },
  sourceText: { marginLeft: spacing.sm, color: colors.primary, fontSize: 15, fontWeight: "600" },
});
