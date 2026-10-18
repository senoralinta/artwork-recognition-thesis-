import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";

import { errorMessage } from "../api/errors";
import { mediaUrl } from "../api/media";
import type { ArtworkDetail } from "../api/types";
import { useAuth } from "../auth/AuthContext";
import ArtFrame from "../components/ArtFrame";
import ArtworkCard from "../components/ArtworkCard";
import PrimaryButton from "../components/PrimaryButton";
import { useI18n } from "../i18n";
import type { RootStackParamList } from "../navigation/types";
import { colors, spacing } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "ArtworkDetail">;

export default function ArtworkDetailScreen({ route }: Props) {
  const { artworkId } = route.params;
  const { t } = useI18n();
  const { request } = useAuth();

  const [artwork, setArtwork] = useState<ArtworkDetail | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setArtwork(await request<ArtworkDetail>(`/artworks/${artworkId}`));
    } catch (e) {
      setError(errorMessage(e, t));
    } finally {
      setLoading(false);
    }
  }, [request, artworkId, t]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (error || !artwork) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <View style={styles.retry}>
          <PrimaryButton title={t.history.retry} onPress={load} variant="secondary" />
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.frame}>
        <ArtFrame uri={mediaUrl(artwork.image_url)} ratio={1} inset={14} lifted />
      </View>
      <ArtworkCard artwork={artwork} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg },
  error: { color: colors.error, textAlign: "center" },
  retry: { marginTop: spacing.md, alignSelf: "stretch" },
  frame: { marginBottom: spacing.lg },
});
