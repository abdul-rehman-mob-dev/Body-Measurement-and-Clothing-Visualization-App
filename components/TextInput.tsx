import React, { useState } from 'react';
import { View, TextInput as RNTextInput, Text, StyleSheet, TextInputProps as RNTextInputProps, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

interface CustomTextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
}

export function TextInput({ label, error, ...props }: CustomTextInputProps) {
  const [secureVisible, setSecureVisible] = useState(false);
  const isPassword = props.secureTextEntry;
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>}
      <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }, error && styles.inputError]}>
        <RNTextInput
          style={[styles.input, { color: colors.text }, isPassword && { paddingRight: 48 }]}
          placeholderTextColor={colors.textTertiary}
          {...props}
          secureTextEntry={isPassword && !secureVisible}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setSecureVisible(!secureVisible)}
          >
            <Ionicons
              name={secureVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textTertiary}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  inputError: {
    borderColor: Colors.error,
  },
  input: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    fontSize: FontSize.lg,
  },
  eyeIcon: {
    padding: Spacing.lg,
  },
  error: {
    fontSize: FontSize.xs,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
});
