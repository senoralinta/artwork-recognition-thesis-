import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { colors, fonts, spacing } from "../theme";

const NOTCH = 22;

// A fact printed on an old museum ticket: dashed edge and punched notches.
export default function TicketCard({ title, text }: { title: string; text: string }) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.ticket}>
        <View style={styles.header}>
          <Ionicons name="sparkles-outline" size={20} color={colors.accent} />
          <Text style={styles.title}>{title}</Text>
        </View>
        <Text style={styles.text}>{text}</Text>
      </View>
      <View style={[styles.notch, styles.notchLeft]} />
      <View style={[styles.notch, styles.notchRight]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { justifyContent: "center" },
  ticket: {
    backgroundColor: colors.ticket,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.accent,
    borderRadius: 6,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  header: { flexDirection: "row", alignItems: "center", marginBottom: spacing.sm },
  title: { fontFamily: fonts.title, fontSize: 18, color: colors.text, marginLeft: spacing.sm },
  text: { fontFamily: fonts.text, fontSize: 17, lineHeight: 26, color: colors.text },
  notch: {
    position: "absolute",
    width: NOTCH,
    height: NOTCH,
    borderRadius: NOTCH / 2,
    backgroundColor: colors.background,
  },
  notchLeft: { left: -NOTCH / 2 },
  notchRight: { right: -NOTCH / 2 },
});
