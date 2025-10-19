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
  Image,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { analyzeImage, AnalysisResult } from '../services/api';
import { savePlant } from '../services/storage';
import AnalysisProgressBar from '../components/Common/AnalysisProgressBar';

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
      
      // Start the actual analysis
      const analysisPromise = analyzeImage(selectedImage);
      
      // Wait for both the progress bar and the actual analysis to complete
      const [result] = await Promise.all([
        analysisPromise,
        // Add a minimum delay to ensure progress bar shows properly
        new Promise(resolve => setTimeout(resolve, 2000))
      ]);
      
      if (result.success) {
        console.log('✅ Analysis successful:', result.results.user_friendly_summary.headline);
        setAnalysisResult(result);
        
        // Save the plant with a default name
        const plantName = result.results.plant_identification?.scientific_name || 'Plant';
        const savedPlant = await savePlant({
          name: `${plantName} - ${new Date().toLocaleDateString()}`,
          imageUri: selectedImage,
          analysisResult: result,
        });
        
        console.log('💾 Plant saved:', savedPlant.id);
        
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
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Upload Image</Text>
          <Text style={styles.subText}>Select an image from your gallery</Text>
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
          <View>
            <TouchableOpacity
              style={[styles.analyzeButton, isAnalyzing && styles.buttonDisabled]}
              onPress={performAnalysis}
              disabled={isAnalyzing}
            >
              <Text style={styles.analyzeButtonText}>
                {isAnalyzing ? 'Analysis in Progress...' : 'Analyze with AI'}
              </Text>
            </TouchableOpacity>
            
            {isAnalyzing && (
              <AnalysisProgressBar
                isAnalyzing={isAnalyzing}
                onComplete={() => {
                  // This will be called when the progress bar completes
                  // The actual analysis completion is handled in performAnalysis
                }}
              />
            )}
          </View>
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
    backgroundColor: '#D4F4DD',
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
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    zIndex: 1,
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
});

