import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius,
} from "../constants/theme";
import { useTheme } from "../context/ThemeContext";
import { useAppStore } from "../store/useAppStore";
import { useAuth } from "../context/AuthContext";
import { saveUserProfile } from "../services/auth";
import { TextInput } from "../components/TextInput";
import { Button } from "../components/Button";

export default function EditProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, setUser, measurements } = useAppStore();
  const { user: authUser, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [profileImage, setProfileImage] = useState(user.profileImage || "");
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please allow photo library access to change your profile picture.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setUser({ name: fullName, email, phone, profileImage });
    if (authUser) {
      try {
        await saveUserProfile(authUser.uid, {
          name: fullName,
          email,
          phone,
          gender: user.gender,
          height: measurements.height,
          weight: measurements.weight,
          age: measurements.age,
          profileImage,
        });
        await refreshProfile();
      } catch (error) {
        Alert.alert("Error", "Failed to save profile");
      }
    }
    setLoading(false);
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={[
              styles.backButton,
              { borderColor: colors.border, backgroundColor: colors.card },
            ]}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>
            Edit Profile
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.avatarSection}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.name.charAt(0) || "?"}
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.changePhotoButton}
            onPress={pickImage}
          >
            <Ionicons name="camera-outline" size={18} color={Colors.primary} />
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <TextInput
            label="FULL NAME"
            placeholder="Enter your name"
            value={fullName}
            onChangeText={setFullName}
          />
          <TextInput
            label="EMAIL"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            label="PHONE"
            placeholder="+1 234 567 890"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        <Button title="Save Changes" onPress={handleSave} loading={loading} />
      </ScrollView>
    </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.xxxl,
    marginTop: Spacing.xxxl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: Spacing.xxxl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: Spacing.md,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  changePhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  changePhotoText: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  form: {
    gap: Spacing.lg,
    marginBottom: Spacing.xxxl,
  },
});
