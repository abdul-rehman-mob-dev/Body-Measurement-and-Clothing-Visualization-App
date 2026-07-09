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
import { Colors, FontSize, FontWeight, Spacing } from "../../constants/theme";
import { useTheme } from "../../context/ThemeContext";
import { signIn, signInWithGoogle, signInWithApple } from "../../services/auth";

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace("/(tabs)");
    } catch (error: any) {
      let message = "Something went wrong";
      if (error.code === "auth/user-not-found") {
        message = "No account found with this email";
      } else if (error.code === "auth/wrong-password") {
        message = "Incorrect password";
      } else if (error.code === "auth/invalid-email") {
        message = "Invalid email address";
      }
      Alert.alert("Sign In Failed", message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert(
        "Google Sign In Failed",
        error.message || "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithApple();
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert(
        "Apple Sign In Failed",
        error.message || "Something went wrong",
      );
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

        <Text style={[styles.title, { color: colors.text }]}>Welcome back</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Sign in to your account
        </Text>

        <View style={styles.form}>
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
        </View>

        <Button title="Sign In" onPress={handleSignIn} loading={loading} />

        <View style={styles.dividerContainer}>
          <View
            style={[styles.dividerLine, { backgroundColor: colors.border }]}
          />
          <Text style={[styles.dividerText, { color: colors.textSecondary }]}>
            or continue with
          </Text>
          <View
            style={[styles.dividerLine, { backgroundColor: colors.border }]}
          />
        </View>

        <View style={styles.socialButtons}>
          <TouchableOpacity
            style={[
              styles.socialButton,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            <Ionicons name="logo-google" size={20} color="#DB4437" />
            <Text style={[styles.socialButtonText, { color: colors.text }]}>
              Google
            </Text>
          </TouchableOpacity>

          {Platform.OS === "ios" && (
            <TouchableOpacity
              style={[
                styles.socialButton,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={handleAppleSignIn}
              disabled={loading}
            >
              <Ionicons name="logo-apple" size={20} color={colors.text} />
              <Text style={[styles.socialButtonText, { color: colors.text }]}>
                Apple
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity onPress={() => router.push("/auth/create-account")}>
          <Text style={[styles.signUpText, { color: colors.textSecondary }]}>
            Don{"'"}t have an account?{" "}
            <Text style={styles.signUpLink}>Sign up</Text>
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
    borderRadius: 16,
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
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing.xxl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    fontSize: FontSize.sm,
  },
  socialButtons: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  socialButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  socialButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  signUpText: {
    textAlign: "center",
    fontSize: FontSize.md,
    marginTop: Spacing.xxl,
  },
  signUpLink: {
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
});
