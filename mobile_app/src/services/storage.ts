/**
 * Storage Service - Handle local storage of analysis results and plant data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnalysisResult } from './api';

export interface SavedPlant {
  id: string;
  name: string;
  imageUri: string;
  analysisResult: AnalysisResult;
  createdAt: string;
  updatedAt: string;
}

const PLANTS_STORAGE_KEY = 'saved_plants';

export const savePlant = async (plant: Omit<SavedPlant, 'id' | 'createdAt' | 'updatedAt'>): Promise<SavedPlant> => {
  try {
    const existingPlants = await getSavedPlants();
    const newPlant: SavedPlant = {
      ...plant,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const updatedPlants = [...existingPlants, newPlant];
    await AsyncStorage.setItem(PLANTS_STORAGE_KEY, JSON.stringify(updatedPlants));
    
    return newPlant;
  } catch (error) {
    console.error('Error saving plant:', error);
    throw error;
  }
};

export const getSavedPlants = async (): Promise<SavedPlant[]> => {
  try {
    const plantsJson = await AsyncStorage.getItem(PLANTS_STORAGE_KEY);
    return plantsJson ? JSON.parse(plantsJson) : [];
  } catch (error) {
    console.error('Error getting saved plants:', error);
    return [];
  }
};

export const updatePlantName = async (plantId: string, newName: string): Promise<void> => {
  try {
    const plants = await getSavedPlants();
    const updatedPlants = plants.map(plant => 
      plant.id === plantId 
        ? { ...plant, name: newName, updatedAt: new Date().toISOString() }
        : plant
    );
    await AsyncStorage.setItem(PLANTS_STORAGE_KEY, JSON.stringify(updatedPlants));
  } catch (error) {
    console.error('Error updating plant name:', error);
    throw error;
  }
};

export const deletePlant = async (plantId: string): Promise<void> => {
  try {
    const plants = await getSavedPlants();
    const updatedPlants = plants.filter(plant => plant.id !== plantId);
    await AsyncStorage.setItem(PLANTS_STORAGE_KEY, JSON.stringify(updatedPlants));
  } catch (error) {
    console.error('Error deleting plant:', error);
    throw error;
  }
};
