/**
 * Settings Screen
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';

export default function SettingsScreen() {
  const [dataSharing, setDataSharing] = React.useState(false);
  const [notifications, setNotifications] = React.useState(true);

  return (
    <View style={styles.container}>
      {/* Subtle plant pattern overlay */}
      <View style={styles.patternOverlay}>
        <Ionicons name="leaf" size={70} color="#228B22" style={styles.patternIcon1} />
        <Ionicons name="leaf" size={65} color="#228B22" style={styles.patternIcon2} />
        <Ionicons name="leaf" size={75} color="#228B22" style={styles.patternIcon3} />
        <Ionicons name="leaf" size={60} color="#228B22" style={styles.patternIcon4} />
        <Ionicons name="leaf" size={68} color="#228B22" style={styles.patternIcon5} />
        <Ionicons name="leaf" size={72} color="#228B22" style={styles.patternIcon6} />
        <Ionicons name="leaf" size={63} color="#228B22" style={styles.patternIcon7} />
        <Ionicons name="leaf" size={66} color="#228B22" style={styles.patternIcon8} />
        <Ionicons name="leaf" size={69} color="#228B22" style={styles.patternIcon9} />
        <Ionicons name="leaf" size={64} color="#228B22" style={styles.patternIcon10} />
        <Ionicons name="leaf" size={71} color="#228B22" style={styles.patternIcon11} />
        <Ionicons name="leaf" size={67} color="#228B22" style={styles.patternIcon12} />
      </View>
      <ScrollView style={styles.scrollView}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Data Sharing</Text>
            <Text style={styles.settingDescription}>
              Help improve AI by sharing anonymous data
            </Text>
          </View>
          <Switch
            value={dataSharing}
            onValueChange={setDataSharing}
            trackColor={{ false: theme.colors.neutral.ashGray, true: theme.colors.primary.leafGreen }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Enable Notifications</Text>
            <Text style={styles.settingDescription}>
              Get alerts for plant health updates
            </Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: theme.colors.neutral.ashGray, true: theme.colors.primary.leafGreen }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <TouchableOpacity style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Version</Text>
          </View>
          <Text style={styles.settingValue}>1.0.0</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Help & Support</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.neutral.textLight} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Privacy Policy</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.neutral.textLight} />
        </TouchableOpacity>
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D4F4DD',
    paddingTop: 60,
    position: 'relative',
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  patternOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    opacity: 0.8,
  },
  patternIcon1: {
    position: 'absolute',
    top: 100,
    left: 50,
    opacity: 0.6,
  },
  patternIcon2: {
    position: 'absolute',
    top: 100,
    right: 50,
    opacity: 0.5,
  },
  patternIcon3: {
    position: 'absolute',
    top: 200,
    left: 80,
    opacity: 0.7,
  },
  patternIcon4: {
    position: 'absolute',
    top: 200,
    right: 80,
    opacity: 0.4,
  },
  patternIcon5: {
    position: 'absolute',
    top: 300,
    left: 40,
    opacity: 0.6,
  },
  patternIcon6: {
    position: 'absolute',
    top: 300,
    right: 40,
    opacity: 0.5,
  },
  patternIcon7: {
    position: 'absolute',
    top: 400,
    left: 120,
    opacity: 0.7,
  },
  patternIcon8: {
    position: 'absolute',
    top: 400,
    right: 120,
    opacity: 0.4,
  },
  patternIcon9: {
    position: 'absolute',
    top: 500,
    left: 60,
    opacity: 0.6,
  },
  patternIcon10: {
    position: 'absolute',
    top: 500,
    right: 60,
    opacity: 0.5,
  },
  patternIcon11: {
    position: 'absolute',
    top: 600,
    left: 100,
    opacity: 0.7,
  },
  patternIcon12: {
    position: 'absolute',
    top: 600,
    right: 100,
    opacity: 0.4,
  },
  section: {
    marginTop: theme.spacing.lg,
    backgroundColor: 'white',
    paddingVertical: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '600',
    color: theme.colors.neutral.textSecondary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral.ashGray,
  },
  settingInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  settingLabel: {
    fontSize: theme.typography.sizes.md,
    fontWeight: '500',
    color: theme.colors.neutral.darkGray,
  },
  settingDescription: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.neutral.textSecondary,
    marginTop: 4,
  },
  settingValue: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.neutral.textSecondary,
  },
});

