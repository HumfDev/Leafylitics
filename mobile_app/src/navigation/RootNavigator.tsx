/**
 * Root Navigator
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import CameraScreen from '../screens/CameraScreen';
import MyPlantsScreen from '../screens/MyPlantsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AnalysisResultsScreen from '../screens/AnalysisResultsScreen';
// import theme from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any = 'leaf';

          if (route.name === 'Camera') {
            iconName = focused ? 'camera' : 'camera-outline';
          } else if (route.name === 'My Plants') {
            iconName = focused ? 'leaf' : 'leaf-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2E7D32',
        tabBarInactiveTintColor: '#424242',
        tabBarShowLabel: false, // Hide tab labels
        headerStyle: {
          backgroundColor: '#F5F3E7',
        },
        headerShown: false, // Hide header completely
      })}
    >
      <Tab.Screen name="Camera" component={CameraScreen} />
      <Tab.Screen name="My Plants" component={MyPlantsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen 
          name="AnalysisResults" 
          component={AnalysisResultsScreen}
          options={{
            headerShown: true,
            headerTitle: 'Analysis Results',
            headerStyle: {
              backgroundColor: '#F5F3E7',
            },
            headerTintColor: '#424242',
            headerTitleStyle: {
              fontWeight: '600',
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

