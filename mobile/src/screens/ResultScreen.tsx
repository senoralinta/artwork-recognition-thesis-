import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Image, Linking, ScrollView, StyleSheet, Text, View } from "react-native";

import { API_URL } from "../config";
import PrimaryButton from "../components/PrimaryButton";
import { useI18n } from "../i18n";
import type { RootStackParamList } from "../navigation/types";
import { colors, radius, spacing } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Result">;

function percent(score: number): string {
  return `${Math.round(score * 100)}%`;
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) {
    return null;
  }
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function ResultScreen({ route, navigation }: Props) {
  const { result, photoUri } = route.params;
  const { t, lang } = useI18n();
  const artwork = result.artwork;

  const description = artwork
    ? lang === "tr"
      ? artwork.description_tr
      : artwork.description_en
    : null;

  // When the artwork was not recognized, show the closest candidate as a guess.
  const best = result.candidates[0];
  const others = result.candidates.slice(1);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.photos}>
        <View style={styles.photoBox}>
          <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" />
        </View>
        {artwork ? (
          <View style={styles.photoBox}>
            <Image
              source={{ uri: `${API_URL}${artwork.image_url}` }}
              style={styles.photo}
              resizeMode="cover"
            />
          </View>
        ) : null}
      </View>

      <Text style={[styles.status, result.recognized ? styles.ok : styles.fail]}>
        {result.recognized ? t.result.recognized : t.result.notRecognized}
      </Text>
      <Text style={styles.score}>
        {t.result.similarity}: {percent(result.score)}
      </Text>

      {result.recognized && artwork ? (
        <View style={styles.card}>
          <Text style={styles.title}>{artwork.title}</Text>
          <Row label={t.result.artist} value={artwork.artist} />
          <Row label={t.result.year} value={artwork.year} />
          <Row label={t.result.type} value={artwork.type} />
          <Row label={t.result.museum} value={artwork.museum} />
          {description ? (
            <>
              <Text style={styles.sectionTitle}>{t.result.description}</Text>
              <Text style={styles.description}>{description}</Text>
            </>
          ) : null}
          {artwork.source_url ? (
            <View style={styles.linkBox}>
              <PrimaryButton
                title={t.result.source}
                variant="secondary"
                onPress={() => Linking.openURL(artwork.source_url as string)}
              />
            </View>
          ) : null}
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.description}>{t.result.notRecognizedHint}</Text>
          {best ? (
            <>
              <Text style={styles.sectionTitle}>{t.result.closestGuess}</Text>
              <Text style={styles.candidate}>
                {best.artwork.title} ({percent(best.score)})
              </Text>
            </>
          ) : null}
        </View>
      )}

      {others.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t.result.others}</Text>
          {others.map((candidate) => (
            <Text key={candidate.artwork.id} style={styles.candidate}>
              {candidate.artwork.title} ({percent(candidate.score)})
            </Text>
          ))}
        </View>
      ) : null}

      <PrimaryButton title={t.result.newPhoto} onPress={() => navigation.goBack()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  photos: { flexDirection: "row", marginBottom: spacing.md },
  photoBox: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.border,
    marginRight: spacing.sm,
  },
  photo: { width: "100%", height: "100%" },
  status: { fontSize: 22, fontWeight: "700" },
  ok: { color: colors.success },
  fail: { color: colors.error },
  score: { color: colors.muted, marginTop: spacing.xs, marginBottom: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  title: { fontSize: 22, fontWeight: "700", color: colors.text, marginBottom: spacing.sm },
  row: { flexDirection: "row", marginBottom: spacing.xs },
  rowLabel: { width: 90, color: colors.muted },
  rowValue: { flex: 1, color: colors.text, fontWeight: "500" },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.text, marginTop: spacing.md },
  description: { fontSize: 15, lineHeight: 22, color: colors.text, marginTop: spacing.xs },
  candidate: { fontSize: 15, color: colors.text, marginTop: spacing.xs },
  linkBox: { marginTop: spacing.md },
});
