/**
 * Analysis Results Screen - Display comprehensive plant health analysis
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AnalysisResult } from '../services/api';

type RootStackParamList = {
  MainTabs: undefined;
  AnalysisResults: {
    results: AnalysisResult;
  };
};

type AnalysisResultsScreenRouteProp = RouteProp<RootStackParamList, 'AnalysisResults'>;
type AnalysisResultsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AnalysisResults'>;

export default function AnalysisResultsScreen() {
  const route = useRoute<AnalysisResultsScreenRouteProp>();
  const navigation = useNavigation<AnalysisResultsScreenNavigationProp>();
  const { results } = route.params;
  const getHealthStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'healthy': return '#4CAF50';
      case 'unhealthy': return '#FF9800';
      case 'critical': return '#F44336';
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

  const renderHealthStatus = () => {
    const summary = results.results.user_friendly_summary;
    const confidence = results.results.overall_confidence || 0;
    
    return (
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Ionicons 
            name={confidence >= 80 ? "checkmark-circle" : "warning"} 
            size={32} 
            color={getHealthStatusColor(summary?.headline)} 
          />
          <Text style={[styles.statusTitle, { color: getHealthStatusColor(summary?.headline) }]}>
            {summary?.headline || 'Analysis Complete'}
          </Text>
        </View>
        <Text style={styles.statusDescription}>
          {summary?.explanation || 'Plant health analysis completed'}
        </Text>
        <View style={styles.confidenceBar}>
          <Text style={styles.confidenceLabel}>Confidence: {confidence}%</Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${confidence}%`, 
                  backgroundColor: getConfidenceColor(confidence) 
                }
              ]} 
            />
          </View>
        </View>
      </View>
    );
  };

  const renderDiseases = () => {
    const diseases = results.results.diagnoses || [];
    
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
              <Text style={styles.diseaseDetail}>Affected Regions: {disease.affected_regions}</Text>
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

  const renderDifferentialDiagnosis = () => {
    const differential = results.results.differential_diagnosis || [];
    
    if (differential.length === 0) {
      return null;
    }

    return (
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>🔍 Differential Diagnosis</Text>
        {differential.map((diagnosis: any, index: number) => (
          <View key={index} style={styles.differentialItem}>
            <Text style={styles.differentialName}>{diagnosis.condition_name}</Text>
            <Text style={styles.differentialConfidence}>Confidence: {diagnosis.confidence}%</Text>
            {diagnosis.distinguishing_features && (
              <Text style={styles.differentialFeatures}>{diagnosis.distinguishing_features}</Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderRecommendations = () => {
    const recommendations = results.results.recommendations;
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

  const renderEnvironmentalFactors = () => {
    const factors = results.results.environmental_factors;
    
    if (!factors || (!factors.likely_contributors?.length && !factors.suggested_adjustments?.length)) {
      return null;
    }

    return (
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>🌍 Environmental Factors</Text>
        {factors.likely_contributors?.length > 0 && (
          <View style={styles.factorSection}>
            <Text style={styles.factorLabel}>Likely Contributors:</Text>
            {factors.likely_contributors.map((contributor: string, index: number) => (
              <Text key={index} style={styles.factorItem}>• {contributor}</Text>
            ))}
          </View>
        )}
        {factors.suggested_adjustments?.length > 0 && (
          <View style={styles.factorSection}>
            <Text style={styles.factorLabel}>Suggested Adjustments:</Text>
            {factors.suggested_adjustments.map((adjustment: string, index: number) => (
              <Text key={index} style={styles.factorItem}>• {adjustment}</Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderImageQuality = () => {
    const imageQuality = results.results.image_quality;
    
    return (
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>📸 Image Quality</Text>
        <View style={styles.qualityRow}>
          <Text style={styles.qualityLabel}>Acceptable:</Text>
          <Text style={[styles.qualityValue, { color: imageQuality.is_acceptable ? '#4CAF50' : '#F44336' }]}>
            {imageQuality.is_acceptable ? 'Yes' : 'No'}
          </Text>
        </View>
        <View style={styles.qualityRow}>
          <Text style={styles.qualityLabel}>Clarity Score:</Text>
          <Text style={styles.qualityValue}>{imageQuality.clarity_score}%</Text>
        </View>
        {imageQuality.issues && imageQuality.issues.length > 0 && (
          <View style={styles.issuesSection}>
            <Text style={styles.issuesLabel}>Issues:</Text>
            {imageQuality.issues.map((issue: string, index: number) => (
              <Text key={index} style={styles.issueItem}>• {issue}</Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderPlantIdentification = () => {
    const plantId = results.results.plant_identification;
    
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
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderHealthStatus()}
        {renderImageQuality()}
        {renderPlantIdentification()}
        {renderDiseases()}
        {renderDifferentialDiagnosis()}
        {renderRecommendations()}
        {renderEnvironmentalFactors()}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Analysis completed at {new Date().toLocaleString()}
          </Text>
        </View>
      </ScrollView>
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
    paddingTop: 60,
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
  confidenceText: {
    fontSize: 12,
    color: '#757575',
    fontStyle: 'italic',
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
  differentialItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  differentialName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 4,
  },
  differentialConfidence: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  differentialFeatures: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
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
  actionItems: {
    marginLeft: 8,
  },
  actionItem: {
    fontSize: 14,
    color: '#424242',
    marginBottom: 4,
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
  factorSection: {
    marginBottom: 16,
  },
  factorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 8,
  },
  factorItem: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#757575',
  },
  qualityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  qualityLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#424242',
  },
  qualityValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
  },
  issuesSection: {
    marginTop: 8,
  },
  issuesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 4,
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
});
