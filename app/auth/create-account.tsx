import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TextInput } from "../../components/TextInput";
import { Button } from "../../components/Button";
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius,
} from "../../constants/theme";
import { useTheme } from "../../context/ThemeContext";
import { signUp } from "../../services/auth";
import { useAppStore } from "../../store/useAppStore";

export default function CreateAccountScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();
  const { setUser } = useAppStore();

  const handleCreateAccount = async () => {
    if (!fullName || !email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, fullName);
      setUser({ name: fullName, email });
      router.push("/profile-setup");
    } catch (error: any) {
      let message = "Something went wrong";
      if (error.code === "auth/email-already-in-use") {
        message = "An account with this email already exists";
      } else if (error.code === "auth/invalid-email") {
        message = "Invalid email address";
      } else if (error.code === "auth/weak-password") {
        message = "Password is too weak";
      }
      Alert.alert("Sign Up Failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={[styles.backButton, { borderColor: colors.border }]}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.iconContainer}>
          <Ionicons name="person-outline" size={28} color={Colors.white} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>
          Create account
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Start your precision fitting journey
        </Text>

        <View style={styles.form}>
          <TextInput
            label="FULL NAME"
            placeholder="Type Here"
            value={fullName}
            onChangeText={setFullName}
          />
          <TextInput
            label="EMAIL"
            placeholder="you@gmail.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            label="PASSWORD"
            placeholder="Min. 8 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <View style={styles.strengthBars}>
            <View style={[styles.bar, { backgroundColor: colors.border }]} />
            <View style={[styles.bar, { backgroundColor: colors.border }]} />
            <View style={[styles.bar, { backgroundColor: colors.border }]} />
            <View style={[styles.bar, { backgroundColor: colors.border }]} />
          </View>
        </View>

        <Button
          title="Create Account"
          onPress={handleCreateAccount}
          loading={loading}
        />

        <TouchableOpacity onPress={() => router.push("/auth/sign-in")}>
          <Text style={[styles.signInText, { color: colors.textSecondary }]}>
            Already have an account?{" "}
            <Text style={styles.signInLink}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xxxl,
    paddingBottom: Spacing.xxl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xxxl,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.md,
    marginBottom: Spacing.xxxl,
  },
  form: {
    marginBottom: Spacing.xxl,
  },
  strengthBars: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  bar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  signInText: {
    textAlign: "center",
    fontSize: FontSize.md,
    marginTop: Spacing.xxl,
  },
  signInLink: {
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
});
