/**
 * Analysis Results Modal - Displays full Gemini analysis results
 * Shows comprehensive analysis instead of just confidence percentage
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AnalysisResultsModalProps {
  visible: boolean;
  analysis: any; // GeminiAnalysisResponse
  onClose: () => void;
}

export const AnalysisResultsModal: React.FC<AnalysisResultsModalProps> = ({
  visible,
  analysis,
  onClose,
}) => {
  if (!analysis) return null;

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return '#16a34a'; // green
    if (confidence >= 70) return '#ca8a04'; // yellow
    if (confidence >= 50) return '#ea580c'; // orange
    return '#dc2626'; // red
  };

  const getSeverityColor = (severity: string) => {
    const colors: { [key: string]: string } = {
      'Healthy': '#16a34a',
      'Mild': '#ca8a04',
      'Moderate': '#ea580c',
      'Severe': '#dc2626',
      'Critical': '#991b1b',
    };
    return colors[severity] || '#6b7280';
  };

  const primaryDiagnosis = analysis.diagnoses?.[0];

  const handleShare = () => {
    // TODO: Implement share functionality
    Alert.alert('Share', 'Share functionality coming soon!');
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Analysis Results</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
              <Ionicons name="share-outline" size={24} color="#2E7D32" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* User-Friendly Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>{analysis.user_friendly_summary?.headline}</Text>
              <Text style={styles.summaryText}>{analysis.user_friendly_summary?.explanation}</Text>
              <Text style={styles.nextSteps}>{analysis.user_friendly_summary?.next_steps}</Text>
            </View>
          </View>

          {/* Plant Identification */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Plant Identification</Text>
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.label}>Common Name:</Text>
                <Text style={styles.value}>{analysis.plant_identification?.common_name}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Scientific Name:</Text>
                <Text style={[styles.value, styles.italic]}>{analysis.plant_identification?.scientific_name}</Text>
              </View>
            </View>
          </View>

          {/* Primary Diagnosis */}
          {primaryDiagnosis && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Primary Diagnosis</Text>
              <View style={styles.card}>
                <View style={styles.row}>
                  <Text style={styles.label}>Condition:</Text>
                  <Text style={styles.value}>{primaryDiagnosis.condition_name}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Scientific Name:</Text>
                  <Text style={[styles.value, styles.italic]}>{primaryDiagnosis.scientific_name}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Confidence:</Text>
                  <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor(primaryDiagnosis.confidence) }]}>
                    <Text style={styles.confidenceText}>{primaryDiagnosis.confidence}%</Text>
                  </View>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Severity:</Text>
                  <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(primaryDiagnosis.severity) }]}>
                    <Text style={styles.severityText}>{primaryDiagnosis.severity}</Text>
                  </View>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Affected Area:</Text>
                  <Text style={styles.value}>{primaryDiagnosis.affected_area_percent}%</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Progression Stage:</Text>
                  <Text style={styles.value}>{primaryDiagnosis.progression_stage}</Text>
                </View>
                
                {/* Visual Description */}
                <View style={styles.descriptionSection}>
                  <Text style={styles.label}>Visual Description:</Text>
                  <Text style={styles.description}>{primaryDiagnosis.visual_description}</Text>
                </View>

                {/* Key Symptoms */}
                <View style={styles.descriptionSection}>
                  <Text style={styles.label}>Key Symptoms:</Text>
                  {primaryDiagnosis.key_symptoms?.map((symptom: string, index: number) => (
                    <Text key={index} style={styles.symptom}>• {symptom}</Text>
                  ))}
                </View>

                {/* Expert Review Warning */}
                {analysis.requires_expert_review && (
                  <View style={styles.warningCard}>
                    <Ionicons name="warning" size={20} color="#f59e0b" />
                    <Text style={styles.warningText}>
                      Expert review recommended due to low confidence
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Recommendations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommendations</Text>
            
            {/* Immediate Actions */}
            {analysis.recommendations?.immediate?.length > 0 && (
              <View style={styles.recommendationSection}>
                <Text style={styles.recommendationTitle}>Immediate Actions (24 hours)</Text>
                {analysis.recommendations.immediate.map((action: any, index: number) => (
                  <View key={index} style={styles.recommendationCard}>
                    <Text style={styles.recommendationAction}>{action.action}</Text>
                    <Text style={styles.recommendationReason}>{action.reason}</Text>
                    <Text style={styles.recommendationOutcome}>Expected: {action.expected_outcome}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Short-term Actions */}
            {analysis.recommendations?.short_term?.length > 0 && (
              <View style={styles.recommendationSection}>
                <Text style={styles.recommendationTitle}>Short-term Actions (1 week)</Text>
                {analysis.recommendations.short_term.map((action: any, index: number) => (
                  <View key={index} style={styles.recommendationCard}>
                    <Text style={styles.recommendationAction}>{action.action}</Text>
                    <Text style={styles.recommendationReason}>{action.reason}</Text>
                    <Text style={styles.recommendationOutcome}>Expected: {action.expected_outcome}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Preventive Actions */}
            {analysis.recommendations?.preventive?.length > 0 && (
              <View style={styles.recommendationSection}>
                <Text style={styles.recommendationTitle}>Preventive Actions (Ongoing)</Text>
                {analysis.recommendations.preventive.map((action: any, index: number) => (
                  <View key={index} style={styles.recommendationCard}>
                    <Text style={styles.recommendationAction}>{action.action}</Text>
                    <Text style={styles.recommendationReason}>{action.reason}</Text>
                    <Text style={styles.recommendationOutcome}>Expected: {action.expected_outcome}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Environmental Factors */}
          {analysis.environmental_factors?.likely_contributors?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Environmental Factors</Text>
              <View style={styles.card}>
                <View style={styles.descriptionSection}>
                  <Text style={styles.label}>Contributing Factors:</Text>
                  {analysis.environmental_factors.likely_contributors.map((factor: string, index: number) => (
                    <Text key={index} style={styles.symptom}>• {factor}</Text>
                  ))}
                </View>
                <View style={styles.descriptionSection}>
                  <Text style={styles.label}>Suggested Adjustments:</Text>
                  {analysis.environmental_factors.suggested_adjustments?.map((adjustment: string, index: number) => (
                    <Text key={index} style={styles.symptom}>• {adjustment}</Text>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Alternative Diagnoses */}
          {analysis.differential_diagnosis?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Alternative Diagnoses</Text>
              {analysis.differential_diagnosis.map((alt: any, index: number) => (
                <View key={index} style={styles.card}>
                  <Text style={styles.alternativeTitle}>{alt.alternative_condition}</Text>
                  <Text style={styles.alternativeDescription}>{alt.distinguishing_features}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F3E7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareButton: {
    padding: 8,
    marginRight: 8,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#1E40AF',
    marginBottom: 8,
  },
  nextSteps: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1D4ED8',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  italic: {
    fontStyle: 'italic',
  },
  confidenceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  confidenceText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  severityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  descriptionSection: {
    marginTop: 16,
  },
  description: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  symptom: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
    lineHeight: 20,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  warningText: {
    fontSize: 14,
    color: '#92400E',
    marginLeft: 8,
    flex: 1,
  },
  recommendationSection: {
    marginBottom: 20,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  recommendationCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  recommendationAction: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  recommendationReason: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  recommendationOutcome: {
    fontSize: 13,
    color: '#059669',
    fontStyle: 'italic',
  },
  alternativeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  alternativeDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
});

export default AnalysisResultsModal;
