import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from 'expo-router';
import { SecureStorage } from '../services/secureStorage';
import { Colors } from '../constants/theme';

export default function PrivacySettingsScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [dataCollection, setDataCollection] = useState(true);
  const [analytics, setAnalytics] = useState(true);
  const [personalization, setPersonalization] = useState(true);

  const handleExportData = async () => {
    try {
      await SecureStorage.exportUserData();
      Alert.alert('Data Exported', 'Your data has been exported successfully.', [{ text: 'OK' }]);
    } catch {
      Alert.alert('Error', 'Failed to export data.');
    }
  };

  const handleDeleteData = async () => {
    Alert.alert(
      'Delete All Data',
      'Are you sure you want to delete all your data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await SecureStorage.clearAllData();
              Alert.alert('Success', 'All data has been deleted.');
            } catch {
              Alert.alert('Error', 'Failed to delete data.');
            }
          },
        },
      ]
    );
  };

  const handleAnonymizeData = async () => {
    Alert.alert(
      'Anonymize Data',
      'This will remove personal identifiers while keeping measurement data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Anonymize',
          onPress: async () => {
            try {
              await SecureStorage.anonymizeData();
              Alert.alert('Success', 'Your data has been anonymized.');
            } catch {
              Alert.alert('Error', 'Failed to anonymize data.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Privacy & Security</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Data Protection</Text>
          
          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="lock-closed" size={20} color={Colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>Encrypted Storage</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: '#4CAF50' }]}>
              <Text style={styles.statusText}>Active</Text>
            </View>
          </View>

          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="shield-checkmark" size={20} color={Colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>Data Collection</Text>
            </View>
            <Switch
              value={dataCollection}
              onValueChange={setDataCollection}
              trackColor={{ false: '#767577', true: Colors.primary + '80' }}
              thumbColor={dataCollection ? Colors.primary : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="analytics" size={20} color={Colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>Analytics</Text>
            </View>
            <Switch
              value={analytics}
              onValueChange={setAnalytics}
              trackColor={{ false: '#767577', true: Colors.primary + '80' }}
              thumbColor={analytics ? Colors.primary : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="person" size={20} color={Colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>Personalization</Text>
            </View>
            <Switch
              value={personalization}
              onValueChange={setPersonalization}
              trackColor={{ false: '#767577', true: Colors.primary + '80' }}
              thumbColor={personalization ? Colors.primary : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Data</Text>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: Colors.primary + '20' }]}
            onPress={handleExportData}
          >
            <Ionicons name="download" size={20} color={Colors.primary} />
            <Text style={[styles.actionText, { color: Colors.primary }]}>Export My Data</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#FF9800' + '20' }]}
            onPress={handleAnonymizeData}
          >
            <Ionicons name="finger-print" size={20} color="#FF9800" />
            <Text style={[styles.actionText, { color: '#FF9800' }]}>Anonymize Data</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#F44336' + '20' }]}
            onPress={handleDeleteData}
          >
            <Ionicons name="trash" size={20} color="#F44336" />
            <Text style={[styles.actionText, { color: '#F44336' }]}>Delete All Data</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>GDPR Compliance</Text>
          <Text style={[styles.infoText, { color: colors.text + 'CC' }]}>
            Your measurement data is encrypted and stored securely on your device. We do not share your personal data with third parties without your explicit consent.
          </Text>
          <Text style={[styles.infoText, { color: colors.text + 'CC', marginTop: 8 }]}>
            You have the right to access, export, or delete your data at any time. Your data is never sold to advertisers or used for marketing purposes.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
