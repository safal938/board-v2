#!/usr/bin/env node

/**
 * Test script for EHR Data API endpoint
 * Tests the new Retrieved Data Zone auto-positioning functionality
 */

const http = require('http');

const API_BASE = 'http://localhost:3001';

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testEHRDataEndpoint() {
  console.log('🧪 Testing EHR Data API Endpoint');
  console.log('=====================================\n');

  try {
    // Test 1: Create auto-positioned EHR data item
    console.log('📋 Test 1: Auto-positioned EHR data (vitals)');
    const ehrData1 = {
      title: 'Patient Vitals - Emergency Department',
      content: 'BP: 140/90 mmHg, HR: 95 bpm, Temp: 38.2°C, SpO2: 96%',
      dataType: 'vitals',
      source: 'Nervecentre'
    };

    const result1 = await makeRequest('POST', '/api/ehr-data', ehrData1);
    console.log(`Status: ${result1.status}`);
    if (result1.status === 201) {
      console.log(`✅ Created EHR item: ${result1.data.id}`);
      console.log(`📍 Position: (${result1.data.x}, ${result1.data.y})`);
      console.log(`📏 Size: ${result1.data.width}x${result1.data.height}`);
      console.log(`🏥 Source: ${result1.data.source}`);
      console.log(`📊 Data Type: ${result1.data.dataType}\n`);
    } else {
      console.log(`❌ Failed: ${JSON.stringify(result1.data)}\n`);
    }

    // Test 2: Create another auto-positioned EHR data item
    console.log('📋 Test 2: Auto-positioned EHR data (clinical notes)');
    const ehrData2 = {
      title: 'Discharge Summary',
      content: 'Patient admitted with chest pain. ECG normal. Troponin negative. Discharged with follow-up cardiology appointment.',
      dataType: 'clinical-notes',
      source: 'Medilogik'
    };

    const result2 = await makeRequest('POST', '/api/ehr-data', ehrData2);
    console.log(`Status: ${result2.status}`);
    if (result2.status === 201) {
      console.log(`✅ Created EHR item: ${result2.data.id}`);
      console.log(`📍 Position: (${result2.data.x}, ${result2.data.y})`);
      console.log(`📏 Size: ${result2.data.width}x${result2.data.height}`);
      console.log(`🏥 Source: ${result2.data.source}`);
      console.log(`📊 Data Type: ${result2.data.dataType}\n`);
    } else {
      console.log(`❌ Failed: ${JSON.stringify(result2.data)}\n`);
    }

    // Test 3: Create manually positioned EHR data item
    console.log('📋 Test 3: Manually positioned EHR data (laboratory)');
    const ehrData3 = {
      title: 'Lab Results - Biochemistry',
      content: 'Na: 142 mmol/L, K: 4.1 mmol/L, Urea: 5.2 mmol/L, Creatinine: 85 μmol/L',
      dataType: 'laboratory',
      source: 'ICE',
      x: 4300,
      y: -4400,
      width: 450,
      height: 320
    };

    const result3 = await makeRequest('POST', '/api/ehr-data', ehrData3);
    console.log(`Status: ${result3.status}`);
    if (result3.status === 201) {
      console.log(`✅ Created EHR item: ${result3.data.id}`);
      console.log(`📍 Position: (${result3.data.x}, ${result3.data.y}) - Manual`);
      console.log(`📏 Size: ${result3.data.width}x${result3.data.height}`);
      console.log(`🏥 Source: ${result3.data.source}`);
      console.log(`📊 Data Type: ${result3.data.dataType}\n`);
    } else {
      console.log(`❌ Failed: ${JSON.stringify(result3.data)}\n`);
    }

    // Test 4: Test validation (missing required fields)
    console.log('📋 Test 4: Validation test (missing title)');
    const ehrData4 = {
      content: 'Some content without title',
      dataType: 'test'
    };

    const result4 = await makeRequest('POST', '/api/ehr-data', ehrData4);
    console.log(`Status: ${result4.status}`);
    if (result4.status === 400) {
      console.log(`✅ Validation working: ${result4.data.error}\n`);
    } else {
      console.log(`❌ Validation failed: ${JSON.stringify(result4.data)}\n`);
    }

    console.log('🎉 EHR Data API tests completed!');
    console.log('\n💡 Tips:');
    console.log('- Auto-positioned items should be in Retrieved Data Zone (x: 4200-6200, y: -4600 to -2500)');
    console.log('- Items should be organized in a grid with proper spacing');
    console.log('- Manual positioning should respect provided coordinates');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Make sure the server is running:');
    console.log('   npm run server');
    console.log('   or');
    console.log('   npm run server-redis');
  }
}

// Run the tests
testEHRDataEndpoint();