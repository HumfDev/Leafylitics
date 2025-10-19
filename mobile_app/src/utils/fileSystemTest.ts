/**
 * FileSystem Test Utility
 * Tests both new and legacy FileSystem APIs
 */

import * as FileSystem from 'expo-file-system';
import * as FileSystemLegacy from 'expo-file-system/legacy';

export const testFileSystem = () => {
  console.log('🧪 Testing FileSystem APIs...');
  
  const newApiAvailable = !!FileSystem?.readAsStringAsync;
  const legacyApiAvailable = !!FileSystemLegacy?.readAsStringAsync;
  
  console.log('📁 New FileSystem API available:', newApiAvailable);
  console.log('📁 Legacy FileSystem API available:', legacyApiAvailable);
  
  if (FileSystem) {
    console.log('📁 New API keys:', Object.keys(FileSystem));
  }
  
  if (FileSystemLegacy) {
    console.log('📁 Legacy API keys:', Object.keys(FileSystemLegacy));
  }
  
  // Test if new API actually works
  if (newApiAvailable) {
    try {
      // Test if EncodingType is available
      console.log('📁 EncodingType available:', !!FileSystem.EncodingType);
      console.log('📁 Base64 encoding available:', !!FileSystem.EncodingType?.Base64);
    } catch (e) {
      console.log('📁 New API test failed:', e.message);
    }
  }
  
  return {
    newApiAvailable,
    legacyApiAvailable,
    recommendedApi: newApiAvailable ? 'new' : 'legacy',
  };
};

export const getSafeEncoding = () => {
  return 'base64'; // Both APIs use string 'base64'
};
