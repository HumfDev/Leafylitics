/**
 * Plant Detail Screen - Show detailed analysis results for a specific plant
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SavedPlant } from '../services/storage';

type RootStackParamList = {
  MainTabs: undefined;
  PlantDetail: {
    plant: SavedPlant;
  };
};

type PlantDetailScreenRouteProp = RouteProp<RootStackParamList, 'PlantDetail'>;
type PlantDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PlantDetail'>;

export default function PlantDetailScreen() {
  const route = useRoute<PlantDetailScreenRouteProp>();
  const navigation = useNavigation<PlantDetailScreenNavigationProp>();
  const { plant } = route.params;

  const getHealthStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'healthy': return '#4CAF50';
      case 'warning': return '#FF9800';
      case 'error': return '#F44336';
      default: return '#757575';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'mild': return '#4CAF50';
      case 'moderate': return '#FF9800';
      case 'severe': return '#FF5722';
      case 'critical': return '#F44336';
      default: return '#757575';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return '#4CAF50';
    if (confidence >= 60) return '#FF9800';
    return '#F44336';
  };

  const getHealthStatus = () => {
    const confidence = plant.analysisResult.results.overall_confidence || 0;
    if (confidence >= 80) return { status: 'healthy', score: confidence };
    if (confidence >= 60) return { status: 'warning', score: confidence };
    return { status: 'error', score: confidence };
  };

  const renderHealthStatus = () => {
    const summary = plant.analysisResult.results.user_friendly_summary;
    const healthStatus = getHealthStatus();
    
    return (
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Ionicons 
            name={healthStatus.status === 'healthy' ? "checkmark-circle" : "warning"} 
            size={32} 
            color={getHealthStatusColor(healthStatus.status)} 
          />
          <Text style={[styles.statusTitle, { color: getHealthStatusColor(healthStatus.status) }]}>
            {summary?.headline || 'Analysis Complete'}
          </Text>
        </View>
        <Text style={styles.statusDescription}>
          {summary?.explanation || 'Plant health analysis completed'}
        </Text>
        <View style={styles.confidenceBar}>
          <Text style={styles.confidenceLabel}>Confidence: {Math.round(healthStatus.score)}%</Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${healthStatus.score}%`, 
                  backgroundColor: getConfidenceColor(healthStatus.score) 
                }
              ]} 
            />
          </View>
        </View>
      </View>
    );
  };

  const renderDiseases = () => {
    const diseases = plant.analysisResult.results.diagnoses || [];
    
    if (diseases.length === 0) {
      return (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>🌿 Disease Detection</Text>
          <Text style={styles.noIssuesText}>No diseases detected</Text>
        </View>
      );
    }

    return (
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>🦠 Disease Detection</Text>
        {diseases.map((disease: any, index: number) => (
          <View key={index} style={styles.issueItem}>
            <View style={styles.issueHeader}>
              <Text style={styles.issueName}>{disease.condition_name}</Text>
              <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(disease.severity) }]}>
                <Text style={styles.severityText}>{disease.severity}</Text>
              </View>
            </View>
            <Text style={styles.issueDescription}>{disease.visual_description}</Text>
            <View style={styles.diseaseDetails}>
              <Text style={styles.diseaseDetail}>Scientific Name: {disease.scientific_name}</Text>
              <Text style={styles.diseaseDetail}>Confidence: {disease.confidence}%</Text>
              <Text style={styles.diseaseDetail}>Affected Area: {disease.affected_area_percent}%</Text>
              <Text style={styles.diseaseDetail}>Progression: {disease.progression_stage}</Text>
            </View>
            {disease.key_symptoms && disease.key_symptoms.length > 0 && (
              <View style={styles.symptomsSection}>
                <Text style={styles.symptomsLabel}>Key Symptoms:</Text>
                {disease.key_symptoms.map((symptom: string, symptomIndex: number) => (
                  <Text key={symptomIndex} style={styles.symptomItem}>• {symptom}</Text>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderRecommendations = () => {
    const recommendations = plant.analysisResult.results.recommendations;
    const allRecommendations = [
      ...(recommendations?.immediate || []),
      ...(recommendations?.short_term || []),
      ...(recommendations?.preventive || [])
    ];

    if (allRecommendations.length === 0) {
      return null;
    }

    return (
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>💡 Recommendations</Text>
        {allRecommendations.map((rec: any, index: number) => (
          <View key={index} style={styles.recommendationItem}>
            <View style={styles.recommendationHeader}>
              <Ionicons 
                name="checkmark-circle" 
                size={20} 
                color="#4CAF50"
              />
              <Text style={styles.recommendationTitle}>Recommendation {index + 1}</Text>
            </View>
            <Text style={styles.recommendationDescription}>{rec.action}</Text>
            {rec.reason && (
              <View style={styles.reasonSection}>
                <Text style={styles.reasonLabel}>Reason:</Text>
                <Text style={styles.reasonText}>{rec.reason}</Text>
              </View>
            )}
            {rec.expected_outcome && (
              <View style={styles.outcomeSection}>
                <Text style={styles.outcomeLabel}>Expected Outcome:</Text>
                <Text style={styles.outcomeText}>{rec.expected_outcome}</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderPlantIdentification = () => {
    const plantId = plant.analysisResult.results.plant_identification;
    
    return (
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>🌿 Plant Identification</Text>
        <View style={styles.plantRow}>
          <Text style={styles.plantLabel}>Scientific Name:</Text>
          <Text style={styles.plantValue}>{plantId.scientific_name}</Text>
        </View>
        <View style={styles.plantRow}>
          <Text style={styles.plantLabel}>Confidence:</Text>
          <Text style={[styles.plantValue, { color: getConfidenceColor(plantId.confidence) }]}>
            {plantId.confidence}%
          </Text>
        </View>
      </View>
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
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#424242" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{plant.name}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: plant.imageUri }} style={styles.plantImage} />
        </View>

        {renderHealthStatus()}
        {renderPlantIdentification()}
        {renderDiseases()}
        {renderRecommendations()}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Analysis completed on {new Date(plant.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D4F4DD',
    position: 'relative',
  },
  safeArea: {
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#424242',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  plantImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginLeft: 12,
  },
  statusDescription: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 16,
    lineHeight: 24,
  },
  confidenceBar: {
    marginTop: 8,
  },
  confidenceLabel: {
    fontSize: 14,
    color: '#424242',
    marginBottom: 8,
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  sectionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 16,
  },
  noIssuesText: {
    fontSize: 16,
    color: '#4CAF50',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  issueItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  issueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  issueName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  issueDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
    lineHeight: 20,
  },
  diseaseDetails: {
    marginTop: 8,
    paddingLeft: 8,
  },
  diseaseDetail: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 2,
  },
  symptomsSection: {
    marginTop: 8,
    paddingLeft: 8,
  },
  symptomsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 4,
  },
  symptomItem: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 2,
  },
  recommendationItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
    marginLeft: 8,
    flex: 1,
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
    lineHeight: 20,
  },
  reasonSection: {
    marginTop: 8,
    paddingLeft: 8,
  },
  reasonLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#757575',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
  },
  outcomeSection: {
    marginTop: 8,
    paddingLeft: 8,
  },
  outcomeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#757575',
    marginBottom: 4,
  },
  outcomeText: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
  },
  plantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  plantLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#424242',
  },
  plantValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
    flex: 1,
    textAlign: 'right',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#757575',
  },
});
