import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { mediaUrl } from "../api/media";
import ArtFrame from "../components/ArtFrame";
import ArtworkCard from "../components/ArtworkCard";
import PrimaryButton from "../components/PrimaryButton";
import ScoreBar from "../components/ScoreBar";
import { useI18n } from "../i18n";
import type { RootStackParamList } from "../navigation/types";
import { colors, fonts, spacing } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Result">;

function percent(score: number): string {
  return `${Math.round(score * 100)}%`;
}

export default function ResultScreen({ route, navigation }: Props) {
  const { result, photoUri } = route.params;
  const { t } = useI18n();
  const artwork = result.artwork;

  // When the artwork was not recognized, the closest candidate is shown as a guess.
  const best = result.candidates[0];
  const others = result.candidates.slice(1);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.photos}>
        <View style={styles.photoColumn}>
          <ArtFrame uri={photoUri} ratio={1} inset={8} />
          <Text style={styles.caption}>{t.result.yourPhoto}</Text>
        </View>
        {artwork ? (
          <View style={styles.photoColumn}>
            <ArtFrame uri={mediaUrl(artwork.image_url)} ratio={1} inset={8} />
            <Text style={styles.caption}>{t.result.reference}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.statusRow}>
        <Ionicons
          name={result.recognized ? "checkmark-circle" : "help-circle"}
          size={28}
          color={result.recognized ? colors.success : colors.error}
        />
        <Text style={[styles.status, { color: result.recognized ? colors.success : colors.error }]}>
          {result.recognized ? t.result.recognized : t.result.notRecognized}
        </Text>
      </View>

      <ScoreBar label={t.result.similarity} score={result.score} />

      {result.recognized && artwork ? (
        <ArtworkCard artwork={artwork} />
      ) : (
        <View>
          <Text style={styles.body}>{t.result.notRecognizedHint}</Text>
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
        <View style={styles.others}>
          <Text style={styles.sectionTitle}>{t.result.others}</Text>
          {others.map((candidate) => (
            <Text key={candidate.artwork.id} style={styles.candidate}>
              {candidate.artwork.title} ({percent(candidate.score)})
            </Text>
          ))}
        </View>
      ) : null}

      <View style={styles.footer}>
        <PrimaryButton title={t.result.newPhoto} onPress={() => navigation.goBack()} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  photos: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.lg },
  photoColumn: { flex: 1, marginRight: spacing.sm },
  caption: { color: colors.muted, fontSize: 13, textAlign: "center", marginTop: spacing.xs },
  statusRow: { flexDirection: "row", alignItems: "center", marginBottom: spacing.md },
  status: { fontFamily: fonts.title, fontSize: 24, marginLeft: spacing.sm },
  body: { fontFamily: fonts.text, fontSize: 17, lineHeight: 26, color: colors.text },
  sectionTitle: {
    fontFamily: fonts.title,
    fontSize: 18,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  candidate: { fontSize: 15, color: colors.text, marginTop: spacing.xs },
  others: { marginTop: spacing.sm },
  footer: { marginTop: spacing.xl },
});
