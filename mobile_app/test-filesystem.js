/**
 * Test FileSystem usage to verify correct syntax
 */

import * as FileSystem from 'expo-file-system';

// Test the correct FileSystem syntax
const testFileSystem = async () => {
  try {
    console.log('🧪 Testing FileSystem API...');
    
    // This should work - correct syntax
    const testUri = 'file://test.jpg';
    
    // ✅ Correct way to read as base64
    const base64 = await FileSystem.readAsStringAsync(testUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    console.log('✅ FileSystem test passed');
    return base64;
  } catch (error) {
    console.error('❌ FileSystem test failed:', error);
    throw error;
  }
};

export default testFileSystem;
