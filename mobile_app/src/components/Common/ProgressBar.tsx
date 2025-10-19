/**
 * Progress Bar Component
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0 to 100
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
  showPercentage?: boolean;
  textColor?: string;
  animated?: boolean;
}

export default function ProgressBar({
  progress,
  height = 8,
  backgroundColor = '#E0E0E0',
  progressColor = '#2E7D32',
  showPercentage = true,
  textColor = '#424242',
  animated = true,
}: ProgressBarProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: progress,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      animatedValue.setValue(progress);
    }
  }, [progress, animated, animatedValue]);

  const progressWidth = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <View style={[styles.progressBar, { height, backgroundColor }]}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: progressWidth,
              backgroundColor: progressColor,
            },
          ]}
        />
      </View>
      {showPercentage && (
        <Text style={[styles.percentageText, { color: textColor }]}>
          {Math.round(progress)}%
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  progressBar: {
    width: '100%',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});
