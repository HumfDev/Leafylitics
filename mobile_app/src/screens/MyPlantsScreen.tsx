/**
 * My Plants Screen - View saved plants and their health history
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import theme from '../theme';
import { getSavedPlants, updatePlantName, deletePlant, SavedPlant } from '../services/storage';

type RootStackParamList = {
  MainTabs: undefined;
  PlantDetail: {
    plant: SavedPlant;
  };
};

type MyPlantsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MainTabs'>;

export default function MyPlantsScreen() {
  const navigation = useNavigation<MyPlantsScreenNavigationProp>();
  const [plants, setPlants] = useState<SavedPlant[]>([]);
  const [editingPlantId, setEditingPlantId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const loadPlants = async () => {
    try {
      const savedPlants = await getSavedPlants();
      setPlants(savedPlants);
    } catch (error) {
      console.error('Error loading plants:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadPlants();
    }, [])
  );

  const handleEditName = (plant: SavedPlant) => {
    setEditingPlantId(plant.id);
    setEditingName(plant.name);
  };

  const handleSaveName = async (plantId: string) => {
    if (editingName.trim()) {
      try {
        await updatePlantName(plantId, editingName.trim());
        await loadPlants();
        setEditingPlantId(null);
        setEditingName('');
      } catch (error) {
        Alert.alert('Error', 'Failed to update plant name');
      }
    }
  };

  const handleDeletePlant = (plantId: string) => {
    Alert.alert(
      'Delete Plant',
      'Are you sure you want to delete this plant?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePlant(plantId);
              await loadPlants();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete plant');
            }
          },
        },
      ]
    );
  };

  const getHealthStatus = (plant: SavedPlant) => {
    const confidence = plant.analysisResult.results.overall_confidence || 0;
    if (confidence >= 80) return { status: 'healthy', score: confidence };
    if (confidence >= 60) return { status: 'warning', score: confidence };
    return { status: 'error', score: confidence };
  };

  const getPlantSpecies = (plant: SavedPlant) => {
    return plant.analysisResult.results.plant_identification?.scientific_name || 'Unknown';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const handlePlantPress = (plant: SavedPlant) => {
    navigation.navigate('PlantDetail', { plant });
  };

  const renderPlant = ({ item }: { item: SavedPlant }) => {
    const healthStatus = getHealthStatus(item);
    const species = getPlantSpecies(item);
    const isEditing = editingPlantId === item.id;

    return (
      <TouchableOpacity 
        style={styles.plantCard}
        onPress={() => handlePlantPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.plantImageContainer}>
          <Image 
            source={{ uri: item.imageUri }} 
            style={styles.plantImage}
            resizeMode="cover"
          />
        </View>
        
        <View style={styles.plantInfo}>
          {isEditing ? (
            <TextInput
              style={styles.nameInput}
              value={editingName}
              onChangeText={setEditingName}
              onSubmitEditing={() => handleSaveName(item.id)}
              autoFocus
            />
          ) : (
            <Text style={styles.plantName}>{item.name}</Text>
          )}
          <Text style={styles.plantSpecies}>{species}</Text>
          <Text style={styles.lastCheck}>Last check: {formatDate(item.createdAt)}</Text>
        </View>
        
        <View style={styles.plantActions}>
          <View style={styles.healthInfo}>
            <View style={[styles.statusBadge, styles[`status_${healthStatus.status}`]]}>
              <Ionicons 
                name={healthStatus.status === 'healthy' ? 'checkmark-circle' : 'alert-circle'} 
                size={20} 
                color="white" 
              />
            </View>
            <Text style={styles.healthScore}>{Math.round(healthStatus.score)}%</Text>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={(e) => {
                e.stopPropagation();
                isEditing ? handleSaveName(item.id) : handleEditName(item);
              }}
            >
              <Ionicons 
                name={isEditing ? 'checkmark' : 'pencil'} 
                size={16} 
                color="#2E7D32" 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={(e) => {
                e.stopPropagation();
                handleDeletePlant(item.id);
              }}
            >
              <Ionicons name="trash" size={16} color="#F44336" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
      {plants.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="leaf-outline" size={64} color={theme.colors.neutral.ashGray} />
          <Text style={styles.emptyText}>No plants yet</Text>
          <Text style={styles.emptySubtext}>
            Take a photo to start tracking your plants
          </Text>
        </View>
      ) : (
        <FlatList
          data={plants}
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
    backgroundColor: '#D4F4DD',
    paddingTop: 60,
    position: 'relative',
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
  list: {
    padding: theme.spacing.md,
    zIndex: 1,
  },
  plantCard: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.md,
  },
  plantImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
    overflow: 'hidden',
  },
  plantImage: {
    width: '100%',
    height: '100%',
  },
  plantInfo: {
    flex: 1,
  },
  plantActions: {
    alignItems: 'flex-end',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: theme.spacing.sm,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.sm,
  },
  nameInput: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '600',
    color: theme.colors.neutral.darkGray,
    borderBottomWidth: 1,
    borderBottomColor: '#2E7D32',
    paddingVertical: 4,
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

