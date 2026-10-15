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
import { colors, spacing } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const { t } = useI18n();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!email.trim() || !password) {
      setError(t.auth.fillAll);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(errorMessage(err, t, "login"));
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
          <Text style={styles.appName}>{t.appName}</Text>
          <Text style={styles.title}>{t.auth.loginTitle}</Text>

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
            textContentType="password"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <PrimaryButton title={t.auth.loginButton} onPress={submit} loading={busy} />

          <Pressable onPress={() => navigation.navigate("Register")} style={styles.switchRow}>
            <Text style={styles.muted}>{t.auth.noAccount} </Text>
            <Text style={styles.link}>{t.auth.registerButton}</Text>
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
  appName: { fontSize: 14, color: colors.primary, fontWeight: "700", letterSpacing: 1 },
  title: { fontSize: 30, fontWeight: "700", color: colors.text, marginBottom: spacing.lg },
  error: { color: colors.error, marginBottom: spacing.md },
  switchRow: { flexDirection: "row", justifyContent: "center", marginTop: spacing.lg },
  muted: { color: colors.muted },
  link: { color: colors.primary, fontWeight: "600" },
});
