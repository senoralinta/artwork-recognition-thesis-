import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { errorMessage } from "../api/errors";
import { useAuth } from "../auth/AuthContext";
import Field from "../components/Field";
import PrimaryButton from "../components/PrimaryButton";
import { useI18n } from "../i18n";
import type { RootStackParamList } from "../navigation/types";
import { colors, fonts, spacing } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export default function RegisterScreen({ navigation }: Props) {
  const { t } = useI18n();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!name.trim() || !email.trim() || !password) {
      setError(t.auth.fillAll);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await register(name.trim(), email.trim(), password);
    } catch (err) {
      setError(errorMessage(err, t, "register"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>{t.auth.registerTitle}</Text>
          <Text style={styles.tagline}>{t.auth.tagline}</Text>

          <Field
            label={t.auth.name}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            textContentType="name"
          />
          <Field
            label={t.auth.email}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
          />
          <Field
            label={t.auth.password}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            textContentType="newPassword"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <PrimaryButton title={t.auth.registerButton} onPress={submit} loading={busy} />

          <Pressable onPress={() => navigation.navigate("Login")} style={styles.switchRow}>
            <Text style={styles.muted}>{t.auth.haveAccount} </Text>
            <Text style={styles.link}>{t.auth.loginButton}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { padding: spacing.lg, flexGrow: 1, justifyContent: "center" },
  title: { fontFamily: fonts.title, fontSize: 34, lineHeight: 40, color: colors.text },
  tagline: {
    fontFamily: fonts.italic,
    fontSize: 17,
    lineHeight: 24,
    color: colors.muted,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  error: { color: colors.error, marginBottom: spacing.md },
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.md,
    minHeight: 44,
  },
  muted: { color: colors.muted },
  link: { color: colors.primary, fontWeight: "600" },
});
