import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../theme";

type Props = {
  label: string;
  // Value between 0 and 1.
  score: number;
  // Text shown on the right. Defaults to the percentage.
  valueText?: string;
};

// A thin gold progress bar with a label and a value.
export default function ScoreBar({ label, score, valueText }: Props) {
  const clamped = Math.max(0, Math.min(1, score));
  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{valueText ?? `${Math.round(clamped * 100)}%`}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${clamped * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.lg },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.xs },
  label: { color: colors.muted, fontSize: 14 },
  value: { color: colors.text, fontSize: 14, fontWeight: "600" },
  track: { height: 6, borderRadius: radius.pill, backgroundColor: colors.mat, overflow: "hidden" },
  fill: { height: 6, borderRadius: radius.pill, backgroundColor: colors.accent },
});
