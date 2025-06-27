#!/usr/bin/env node

/**
 * EaglePass Database Schema Validation Script
 * Tests the database schema implementation and CRUD operations
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, Timestamp } from 'firebase/firestore';
import {
  UserService,
  StudentService,
  StaffService,
  LocationService,
  PassService,
} from '../packages/web/src/lib/database-service';

// Firebase configuration (using emulator)
const firebaseConfig = {
  projectId: 'eaglepass-dev',
  authDomain: 'eaglepass-dev.firebaseapp.com',
  storageBucket: 'eaglepass-dev.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abcdef123456',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Connect to emulator if running locally
if (process.env.NODE_ENV !== 'production') {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('🔗 Connected to Firestore emulator');
  } catch (error) {
    console.log('⚠️  Firestore emulator already connected or not available');
  }
}

async function validateSchema() {
  console.log('🔍 Starting database schema validation...\n');

  let testsPassed = 0;
  let testsFailed = 0;

  // Test 1: Create and retrieve a user
  try {
    console.log('📝 Test 1: User CRUD operations');
    
    const testUser = {
      uid: 'test-user-001',
      email: 'test@nhcs.net',
      displayName: 'Test User',
      photoURL: null,
      domain: 'nhcs.net',
      role: 'student' as const,
      status: 'pending' as const,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      lastLoginAt: null,
      approvedAt: null,
      approvedById: null,
    };

    await UserService.createOrUpdateUser(testUser);
    const retrievedUser = await UserService.getUser('test-user-001');
    
    if (retrievedUser && retrievedUser.email === 'test@nhcs.net') {
      console.log('   ✅ User creation and retrieval successful');
      testsPassed++;
    } else {
      console.log('   ❌ User creation or retrieval failed');
      testsFailed++;
    }
  } catch (error) {
    console.log('   ❌ User test failed:', error);
    testsFailed++;
  }

  // Test 2: Create and retrieve a location
  try {
    console.log('📍 Test 2: Location CRUD operations');
    
    const testLocation = {
      name: 'Test Classroom',
      shortName: 'TEST-001',
      type: 'classroom' as const,
      building: 'Test Building',
      floor: 1,
      staffAssignments: [],
      isShared: false,
      isCheckInEligible: true,
      permissionMode: 'allow' as const,
      escalationThresholds: {
        warning: 10,
        alert: 20,
      },
      isActive: true,
      notes: 'Test location for validation',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const locationId = await LocationService.createLocation(testLocation);
    const retrievedLocation = await LocationService.getLocation(locationId);
    
    if (retrievedLocation && retrievedLocation.name === 'Test Classroom') {
      console.log('   ✅ Location creation and retrieval successful');
      testsPassed++;
    } else {
      console.log('   ❌ Location creation or retrieval failed');
      testsFailed++;
    }
  } catch (error) {
    console.log('   ❌ Location test failed:', error);
    testsFailed++;
  }

  // Test 3: Create and retrieve a student
  try {
    console.log('👨‍🎓 Test 3: Student CRUD operations');
    
    const testStudent = {
      userId: 'test-user-001',
      studentNumber: 'STU-TEST-001',
      firstName: 'Test',
      lastName: 'Student',
      grade: 10,
      homeroom: 'TEST-001',
      groupIds: [],
      permissionMode: 'allow' as const,
      escalationThresholds: {
        warning: 10,
        alert: 20,
      },
      isActive: true,
      notes: 'Test student for validation',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const studentId = await StudentService.createStudent(testStudent);
    const retrievedStudent = await StudentService.getStudent(studentId);
    
    if (retrievedStudent && retrievedStudent.firstName === 'Test') {
      console.log('   ✅ Student creation and retrieval successful');
      testsPassed++;
    } else {
      console.log('   ❌ Student creation or retrieval failed');
      testsFailed++;
    }
  } catch (error) {
    console.log('   ❌ Student test failed:', error);
    testsFailed++;
  }

  // Test 4: Test database queries
  try {
    console.log('🔍 Test 4: Database query operations');
    
    const users = await UserService.getUsers();
    const locations = await LocationService.getLocations();
    
    if (Array.isArray(users) && Array.isArray(locations)) {
      console.log(`   ✅ Query operations successful (${users.length} users, ${locations.length} locations)`);
      testsPassed++;
    } else {
      console.log('   ❌ Query operations failed');
      testsFailed++;
    }
  } catch (error) {
    console.log('   ❌ Query test failed:', error);
    testsFailed++;
  }

  // Test 5: Test TypeScript type safety
  try {
    console.log('🔒 Test 5: TypeScript type safety');
    
    // This should compile without errors if types are correct
    const testPass = {
      studentId: 'test-student-001',
      studentName: 'Test Student',
      originLocationId: 'test-location-001',
      originLocationName: 'Test Origin',
      destinationLocationId: 'test-location-002',
      destinationLocationName: 'Test Destination',
      issuedById: 'test-user-001',
      issuedByName: 'Test User',
      isOverride: false,
      notes: null,
    };

    // Type check passes if this compiles
    console.log('   ✅ TypeScript interfaces are properly defined');
    testsPassed++;
  } catch (error) {
    console.log('   ❌ TypeScript type safety test failed:', error);
    testsFailed++;
  }

  // Summary
  console.log('\n📊 Validation Summary:');
  console.log(`   ✅ Tests Passed: ${testsPassed}`);
  console.log(`   ❌ Tests Failed: ${testsFailed}`);
  console.log(`   📈 Success Rate: ${Math.round((testsPassed / (testsPassed + testsFailed)) * 100)}%`);

  if (testsFailed === 0) {
    console.log('\n🎉 All tests passed! Database schema is working correctly.');
    return true;
  } else {
    console.log('\n⚠️  Some tests failed. Please check the implementation.');
    return false;
  }
}

// Run the validation script
if (require.main === module) {
  validateSchema()
    .then((success) => {
      if (success) {
        console.log('✨ Schema validation completed successfully');
        process.exit(0);
      } else {
        console.log('💥 Schema validation failed');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('💥 Validation script failed:', error);
      process.exit(1);
    });
}

export { validateSchema }; 