/**
 * Analysis Progress Bar Component - Shows progress with stages
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import ProgressBar from './ProgressBar';

interface AnalysisProgressBarProps {
  isAnalyzing: boolean;
  onComplete?: () => void;
}

const ANALYSIS_STAGES = [
  { label: 'Uploading image...', progress: 20 },
  { label: 'Processing with AI...', progress: 50 },
  { label: 'Analyzing plant health...', progress: 80 },
  { label: 'Generating results...', progress: 99 },
];

export default function AnalysisProgressBar({ isAnalyzing, onComplete }: AnalysisProgressBarProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isAnalyzing) {
      setCurrentStage(0);
      setProgress(0);
      return;
    }

    let stageIndex = 0;
    const interval = setInterval(() => {
      if (stageIndex < ANALYSIS_STAGES.length) {
        const stage = ANALYSIS_STAGES[stageIndex];
        setCurrentStage(stageIndex);
        
        // Animate progress to the stage's target
        const startProgress = stageIndex === 0 ? 0 : ANALYSIS_STAGES[stageIndex - 1].progress;
        const endProgress = stage.progress;
        const duration = 1000; // 1 second per stage
        const steps = 20;
        const stepSize = (endProgress - startProgress) / steps;
        const stepDuration = duration / steps;
        
        let currentStep = 0;
        const progressInterval = setInterval(() => {
          currentStep++;
          const newProgress = startProgress + (stepSize * currentStep);
          setProgress(Math.min(newProgress, endProgress));
          
          if (currentStep >= steps) {
            clearInterval(progressInterval);
            if (stageIndex === ANALYSIS_STAGES.length - 1) {
              // Analysis complete
              setTimeout(() => {
                onComplete?.();
              }, 500);
            }
          }
        }, stepDuration);
        
        stageIndex++;
      } else {
        clearInterval(interval);
      }
    }, 1200); // Slight delay between stages

    return () => {
      clearInterval(interval);
    };
  }, [isAnalyzing, onComplete]);

  if (!isAnalyzing) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ProgressBar
        progress={progress}
        height={12}
        backgroundColor="#E0E0E0"
        progressColor="#2E7D32"
        showPercentage={true}
        textColor="#424242"
        animated={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 16,
  },
});
