/**
 * Camera Screen - Capture leaf photos for analysis
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { analyzeImage, AnalysisResult } from '../services/api';

type RootStackParamList = {
  MainTabs: undefined;
  AnalysisResults: {
    results: AnalysisResult;
  };
};

type CameraScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MainTabs'>;

export default function CameraScreen() {
  const navigation = useNavigation<CameraScreenNavigationProp>();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
        console.log('Image picked:', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Pick image error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const testConnection = async () => {
    try {
      // Use the same dynamic IP logic as the API service
      const API_BASE_URL = Platform.OS === 'android' 
        ? 'http://10.0.2.2:3001' 
        : 'http://10.19.146.211:3001';
      
      console.log('🏥 Testing backend connection...');
      console.log('📡 Connecting to:', API_BASE_URL + '/health');
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      console.log('✅ Backend health:', data);
      
      Alert.alert(
        'Connection Test',
        `Status: ${data.success ? 'Connected' : 'Failed'}\nMessage: ${data.message}\nVersion: ${data.version}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      Alert.alert(
        'Connection Failed',
        'Cannot reach backend server. Make sure it\'s running on port 3001.',
        [{ text: 'OK' }]
      );
    }
  };

  const performAnalysis = async () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please select an image first');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      console.log('🧠 Analyzing with Gemini AI...');
      const result = await analyzeImage(selectedImage);
      
      if (result.success) {
        console.log('✅ Analysis successful:', result.results.user_friendly_summary.headline);
        setAnalysisResult(result);
        
        // Navigate to the analysis results screen
        navigation.navigate('AnalysisResults', { results: result });
      } else {
        throw new Error('Analysis failed');
      }
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze image';
      setError(errorMessage);
      
      Alert.alert(
        'Analysis Failed',
        'Unable to analyze the image. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Upload Leaf Image</Text>
          <Text style={styles.subText}>Select an image from your gallery</Text>
          
          <TouchableOpacity style={styles.testButton} onPress={testConnection}>
            <Text style={styles.testButtonText}>Test Backend Connection</Text>
          </TouchableOpacity>
        </View>

        {selectedImage ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
            <TouchableOpacity style={styles.changeImageButton} onPress={pickImage}>
              <Text style={styles.changeImageText}>Change Image</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
            <Ionicons name="cloud-upload-outline" size={64} color="#2E7D32" />
            <Text style={styles.uploadText}>Tap to Upload Image</Text>
            <Text style={styles.uploadSubtext}>JPG, PNG supported</Text>
          </TouchableOpacity>
        )}

        {selectedImage && (
          <TouchableOpacity
            style={[styles.analyzeButton, isAnalyzing && styles.buttonDisabled]}
            onPress={performAnalysis}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <ActivityIndicator size="large" color="white" />
                <Text style={styles.analyzeButtonText}>Analyzing with AI...</Text>
              </>
            ) : (
              <Text style={styles.analyzeButtonText}>Analyze with AI</Text>
            )}
          </TouchableOpacity>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F3E7',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 8,
  },
  subText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
  uploadButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  uploadText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E7D32',
    marginTop: 16,
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
  imageContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  selectedImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  changeImageButton: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  changeImageText: {
    fontSize: 14,
    color: '#424242',
    fontWeight: '500',
  },
  analyzeButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  analyzeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    fontWeight: '500',
  },
  testButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 12,
  },
  testButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
});

