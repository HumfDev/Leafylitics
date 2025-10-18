/**
 * My Plants Screen - View saved plants and their health history
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';

// Mock data
const MOCK_PLANTS = [
  {
    id: '1',
    name: 'Tomato Plant #1',
    species: 'Tomato',
    lastCheck: '2 days ago',
    status: 'healthy',
    healthScore: 95,
  },
  {
    id: '2',
    name: 'Apple Tree',
    species: 'Apple',
    lastCheck: '1 week ago',
    status: 'warning',
    healthScore: 72,
  },
];

export default function MyPlantsScreen() {
  const renderPlant = ({ item }: any) => (
    <TouchableOpacity style={styles.plantCard}>
      <View style={styles.plantInfo}>
        <Text style={styles.plantName}>{item.name}</Text>
        <Text style={styles.plantSpecies}>{item.species}</Text>
        <Text style={styles.lastCheck}>Last check: {item.lastCheck}</Text>
      </View>
      
      <View style={styles.healthInfo}>
        <View style={[styles.statusBadge, styles[`status_${item.status}`]]}>
          <Ionicons 
            name={item.status === 'healthy' ? 'checkmark-circle' : 'alert-circle'} 
            size={24} 
            color="white" 
          />
        </View>
        <Text style={styles.healthScore}>{item.healthScore}%</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {MOCK_PLANTS.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="leaf-outline" size={64} color={theme.colors.neutral.ashGray} />
          <Text style={styles.emptyText}>No plants yet</Text>
          <Text style={styles.emptySubtext}>
            Take a photo to start tracking your plants
          </Text>
        </View>
      ) : (
        <FlatList
          data={MOCK_PLANTS}
          renderItem={renderPlant}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral.earthBeige,
  },
  list: {
    padding: theme.spacing.md,
  },
  plantCard: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    ...theme.shadows.md,
  },
  plantInfo: {
    flex: 1,
  },
  plantName: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '600',
    color: theme.colors.neutral.darkGray,
    marginBottom: 4,
  },
  plantSpecies: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.neutral.textSecondary,
    marginBottom: 8,
  },
  lastCheck: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.neutral.textLight,
  },
  healthInfo: {
    alignItems: 'center',
  },
  statusBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  status_healthy: {
    backgroundColor: theme.colors.semantic.success,
  },
  status_warning: {
    backgroundColor: theme.colors.semantic.warning,
  },
  status_error: {
    backgroundColor: theme.colors.semantic.error,
  },
  healthScore: {
    fontSize: theme.typography.sizes.md,
    fontWeight: '600',
    color: theme.colors.neutral.darkGray,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: '600',
    color: theme.colors.neutral.darkGray,
    marginTop: theme.spacing.md,
  },
  emptySubtext: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.neutral.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
});

