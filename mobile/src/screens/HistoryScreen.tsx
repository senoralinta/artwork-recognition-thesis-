import { Ionicons } from "@expo/vector-icons";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CompositeNavigationProp, useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { errorMessage } from "../api/errors";
import { mediaUrl } from "../api/media";
import type { HistoryItem } from "../api/types";
import { useAuth } from "../auth/AuthContext";
import ArtFrame from "../components/ArtFrame";
import PrimaryButton from "../components/PrimaryButton";
import { useI18n } from "../i18n";
import type { MainTabParamList, RootStackParamList } from "../navigation/types";
import { colors, fonts, spacing } from "../theme";

type HistoryNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, "History">,
  NativeStackNavigationProp<RootStackParamList>
>;

// Key of the folder that holds scans that did not match any artwork.
const UNRECOGNIZED = "__unrecognized__";
// Key of the folder for artworks whose museum is not known.
const OTHER = "__other__";

type Row =
  | { kind: "folder"; key: string; title: string; count: number; open: boolean }
  | { kind: "entry"; key: string; item: HistoryItem };

function percent(score: number): string {
  return `${Math.round(score * 100)}%`;
}

function folderKey(item: HistoryItem): string {
  if (!item.recognized || !item.artwork) {
    return UNRECOGNIZED;
  }
  return item.artwork.museum?.trim() || OTHER;
}

export default function HistoryScreen() {
  const { t, lang } = useI18n();
  const { request } = useAuth();
  const navigation = useNavigation<HistoryNavigation>();

  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  // Folders the user has closed. Everything is open by default.
  const [closed, setClosed] = useState<Record<string, boolean>>({});

  const load = useCallback(
    async (pullToRefresh = false) => {
      if (pullToRefresh) {
        setRefreshing(true);
      }
      setError("");
      try {
        setItems(await request<HistoryItem[]>("/history?limit=100&offset=0"));
      } catch (e) {
        setError(errorMessage(e, t));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [request, t]
  );

  // Reload every time the tab comes into focus, so new recognitions show up.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // One folder per museum (newest activity first), unrecognized scans last.
  const rows = useMemo<Row[]>(() => {
    const groups = new Map<string, HistoryItem[]>();
    for (const item of items) {
      const key = folderKey(item);
      groups.set(key, [...(groups.get(key) ?? []), item]);
    }
    const keys = Array.from(groups.keys()).sort((a, b) => {
      if (a === UNRECOGNIZED) {
        return 1;
      }
      if (b === UNRECOGNIZED) {
        return -1;
      }
      return 0;
    });

    const result: Row[] = [];
    for (const key of keys) {
      const entries = groups.get(key) ?? [];
      const title =
        key === UNRECOGNIZED
          ? t.history.unrecognizedFolder
          : key === OTHER
            ? t.history.otherMuseum
            : key;
      const open = !closed[key];
      result.push({ kind: "folder", key: `folder-${key}`, title, count: entries.length, open });
      if (open) {
        for (const item of entries) {
          result.push({ kind: "entry", key: `entry-${item.id}`, item });
        }
      }
    }
    return result;
  }, [items, closed, t]);

  function toggleFolder(rowKey: string) {
    const key = rowKey.replace(/^folder-/, "");
    setClosed((current) => ({ ...current, [key]: !current[key] }));
  }

  function confirmDelete(item: HistoryItem) {
    Alert.alert(t.history.deleteTitle, t.history.deleteMessage, [
      { text: t.history.cancel, style: "cancel" },
      {
        text: t.history.delete,
        style: "destructive",
        onPress: async () => {
          try {
            await request<void>(`/history/${item.id}`, { method: "DELETE" });
            setItems((current) => current.filter((entry) => entry.id !== item.id));
          } catch (e) {
            setError(errorMessage(e, t));
          }
        },
      },
    ]);
  }

  function formatDate(value: string): string {
    return new Date(value).toLocaleString(lang === "tr" ? "tr-TR" : "en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  function renderRow({ item: row }: { item: Row }) {
    if (row.kind === "folder") {
      return (
        <Pressable
          onPress={() => toggleFolder(row.key)}
          style={styles.folder}
          accessibilityRole="button"
          accessibilityState={{ expanded: row.open }}
        >
          <Ionicons
            name={row.open ? "folder-open-outline" : "folder-outline"}
            size={26}
            color={colors.primary}
          />
          <View style={styles.folderText}>
            <Text style={styles.folderTitle} numberOfLines={2}>
              {row.title}
            </Text>
            <Text style={styles.folderCount}>{t.history.entries(row.count)}</Text>
          </View>
          <Ionicons name={row.open ? "chevron-up" : "chevron-down"} size={20} color={colors.muted} />
        </Pressable>
      );
    }

    const entry = row.item;
    const artwork = entry.artwork;
    const canOpen = entry.recognized && artwork !== null;

    return (
      <View style={styles.row}>
        <Pressable
          style={styles.rowMain}
          disabled={!canOpen}
          onPress={() => artwork && navigation.navigate("ArtworkDetail", { artworkId: artwork.id })}
        >
          <View style={styles.thumb}>
            <ArtFrame uri={artwork ? mediaUrl(artwork.image_url) : null} ratio={1} inset={5} />
          </View>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle} numberOfLines={2}>
              {artwork ? artwork.title : t.history.notRecognized}
            </Text>
            {artwork?.artist ? (
              <Text style={styles.rowArtist} numberOfLines={1}>
                {artwork.artist}
              </Text>
            ) : null}
            <Text style={styles.rowMeta}>
              {formatDate(entry.created_at)} - {percent(entry.score)}
            </Text>
          </View>
        </Pressable>
        <Pressable
          onPress={() => confirmDelete(entry)}
          hitSlop={8}
          style={styles.deleteButton}
          accessibilityRole="button"
          accessibilityLabel={t.history.delete}
        >
          <Ionicons name="trash-outline" size={22} color={colors.muted} />
        </Pressable>
      </View>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Text style={styles.title}>{t.history.title}</Text>
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.error}>{error}</Text>
          <PrimaryButton title={t.history.retry} onPress={() => load()} variant="secondary" />
        </View>
      ) : null}
      <FlatList
        data={rows}
        keyExtractor={(row) => row.key}
        renderItem={renderRow}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={() => load(true)}
        ListEmptyComponent={
          error ? null : (
            <View style={styles.empty}>
              <Ionicons name="images-outline" size={56} color={colors.frame} />
              <Text style={styles.emptyTitle}>{t.history.empty}</Text>
              <Text style={styles.emptyHint}>{t.history.emptyHint}</Text>
              <View style={styles.emptyAction}>
                <PrimaryButton
                  title={t.history.emptyAction}
                  onPress={() => navigation.navigate("Identify")}
                />
              </View>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  title: {
    fontFamily: fonts.title,
    fontSize: 32,
    lineHeight: 38,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, flexGrow: 1 },
  folder: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.mat,
    borderRadius: 10,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  folderText: { flex: 1, marginLeft: spacing.md },
  folderTitle: { fontFamily: fonts.title, fontSize: 17, lineHeight: 22, color: colors.text },
  folderCount: { color: colors.muted, fontSize: 13, marginTop: 2 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowMain: { flex: 1, flexDirection: "row", alignItems: "center" },
  thumb: { width: 72 },
  rowText: { flex: 1, marginLeft: spacing.md },
  rowTitle: { fontFamily: fonts.title, fontSize: 17, lineHeight: 22, color: colors.text },
  rowArtist: { fontFamily: fonts.italic, fontSize: 14, color: colors.muted, marginTop: 2 },
  rowMeta: { fontSize: 13, color: colors.muted, marginTop: spacing.xs },
  deleteButton: { padding: spacing.sm, marginLeft: spacing.xs },
  errorBox: { paddingHorizontal: spacing.lg },
  error: { color: colors.error, marginBottom: spacing.sm },
  empty: { alignItems: "center", marginTop: spacing.xl, paddingHorizontal: spacing.lg },
  emptyTitle: {
    fontFamily: fonts.title,
    fontSize: 22,
    color: colors.text,
    textAlign: "center",
    marginTop: spacing.md,
  },
  emptyHint: { color: colors.muted, textAlign: "center", marginTop: spacing.xs, fontSize: 15 },
  emptyAction: { alignSelf: "stretch", marginTop: spacing.lg },
});
