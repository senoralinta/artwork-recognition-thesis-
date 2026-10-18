import { Image, StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { colors, radius } from "../theme";

type Props = {
  uri?: string | null;
  // Width divided by height of the window that holds the artwork.
  ratio?: number;
  // Width of the mat around the artwork.
  inset?: number;
  // Adds a soft shadow, used for the large presentations of a single work.
  lifted?: boolean;
  style?: StyleProp<ViewStyle>;
};

// An artwork presented on a mat inside a thin frame, like on a gallery wall.
// The whole painting is always visible (never cropped).
export default function ArtFrame({ uri, ratio = 1, inset = 10, lifted = false, style }: Props) {
  return (
    <View style={[styles.frame, { padding: inset }, lifted && styles.lifted, style]}>
      <View style={[styles.window, { aspectRatio: ratio }]}>
        {uri ? <Image source={{ uri }} style={styles.image} resizeMode="contain" /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: colors.mat,
    borderWidth: 1,
    borderColor: colors.frame,
    borderRadius: radius.sm / 3,
  },
  window: { width: "100%" },
  image: { width: "100%", height: "100%" },
  lifted: {
    shadowColor: "#2B2622",
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
});
