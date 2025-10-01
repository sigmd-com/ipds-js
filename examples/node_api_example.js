#!/usr/bin/env node

/**
 * IPDS Node.js API Usage Examples
 * This script demonstrates how to use the IPDS Node.js API.
 */

const fs = require('fs');
const path = require('path');

// IPDS 모듈 import
const { IPInfo, IPValidator } = require('../dist/index.js');

async function basicIpAnalysis() {
  console.log('=== Basic IP Analysis Example ===');
  
  const ipAddresses = [
    '8.8.8.8',      // Google DNS
    '1.1.1.1',      // Cloudflare DNS
    '192.168.1.1',  // Private IP
    '10.0.0.1',     // Private IP
    '127.0.0.1',    // Loopback
  ];
  
  const validator = new IPValidator();
  
  for (const ip of ipAddresses) {
    console.log(`\n--- ${ip} Analysis ---`);
    
    try {
      // IP validation
      if (!validator.isValid(ip)) {
        console.log(`❌ Invalid IP address: ${ip}`);
        continue;
      }
      
      // Create IPInfo object
      const ipInfo = new IPInfo(ip);
      
      // Get basic information
      const basicInfo = ipInfo.getBasicInfo();
      console.log(`IP Version: IPv${basicInfo.version}`);
      console.log(`Private IP: ${basicInfo.is_private}`);
      console.log(`Global IP: ${basicInfo.is_global}`);
      console.log(`Loopback IP: ${basicInfo.is_loopback}`);
      
      // Get network information
      const networkInfo = await ipInfo.getNetworkInfo();
      if (networkInfo.network_range) {
        console.log(`Network Range: ${networkInfo.network_range}`);
        console.log(`Subnet Mask: ${networkInfo.subnet_mask}`);
        console.log(`Broadcast: ${networkInfo.broadcast_address}`);
      }
      
    } catch (error) {
      console.log(`❌ Error occurred: ${error.message}`);
    }
  }
}

async function networkAnalysis() {
  console.log('\n=== Network Analysis Example ===');
  
  const testIps = {
    'Google DNS': '8.8.8.8',
    'Cloudflare DNS': '1.1.1.1',
    'Class A Private': '10.0.0.1',
    'Class B Private': '172.16.0.1',
    'Class C Private': '192.168.1.1',
    'Loopback': '127.0.0.1',
    'Link Local': '169.254.1.1'
  };
  
  for (const [name, ip] of Object.entries(testIps)) {
    console.log(`\n--- ${name} (${ip}) ---`);
    
    try {
      const ipInfo = new IPInfo(ip);
      const networkInfo = await ipInfo.getNetworkInfo();
      
      console.log(`IP Type: ${networkInfo.ip_type || 'Unknown'}`);
      console.log(`Private IP: ${networkInfo.is_private || 'Unknown'}`);
      
      if (networkInfo.network_range) {
        console.log(`Network Range: ${networkInfo.network_range}`);
        console.log(`Subnet Mask: ${networkInfo.subnet_mask}`);
        console.log(`CIDR Notation: ${networkInfo.subnet_mask_cidr}`);
        console.log(`Total Addresses: ${networkInfo.total_addresses}`);
        console.log(`Usable Addresses: ${networkInfo.usable_addresses}`);
      }
      
      if (networkInfo.asn) {
        console.log(`ASN: ${networkInfo.asn}`);
        console.log(`ASN Name: ${networkInfo.asn_name || 'Unknown'}`);
      }
      
    } catch (error) {
      console.log(`❌ Error occurred: ${error.message}`);
    }
  }
}

async function batchProcessing() {
  console.log('\n=== Batch Processing Example ===');
  
  // IP list
  const ipList = [
    '8.8.8.8',
    '1.1.1.1', 
    '192.168.1.1',
    '10.0.0.1',
  ];
  
  const results = [];
  
  console.log(`Processing ${ipList.length} IP addresses...`);
  
  for (let i = 0; i < ipList.length; i++) {
    const ip = ipList[i];
    console.log(`Processing... (${i + 1}/${ipList.length}) ${ip}`);
    
    try {
      const ipInfo = new IPInfo(ip);
      
      // Query only necessary information (performance optimization)
      const result = {
        ip_address: ip,
        basic_info: ipInfo.getBasicInfo(),
        network_info: await ipInfo.getNetworkInfo()
      };
      
      results.push(result);
      
    } catch (error) {
      console.log(`❌ Error processing ${ip}: ${error.message}`);
      results.push({
        ip_address: ip,
        error: error.message
      });
    }
  }
  
  // Save results to JSON file
  const outputFile = 'batch_processing_results.json';
  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
  
  console.log(`\n✅ Batch processing completed! Results saved to ${outputFile}.`);
  
  // Print simple statistics
  const privateCount = results.filter(r => r.basic_info?.is_private).length;
  const publicCount = results.length - privateCount;
  
  console.log(`\n📊 Statistics:`);
  console.log(`  - Total processed IPs: ${results.length}`);
  console.log(`  - Private IPs: ${privateCount}`);
  console.log(`  - Public IPs: ${publicCount}`);
}

async function customAnalysis() {
  console.log('\n=== Custom Analysis Example ===');
  
  function analyzeIpSecurity(ip) {
    try {
      const ipInfo = new IPInfo(ip);
      const basicInfo = ipInfo.getBasicInfo();
      
      const securityAnalysis = {
        ip_address: ip,
        is_private: basicInfo.is_private,
        is_global: basicInfo.is_global,
        is_loopback: basicInfo.is_loopback,
        is_multicast: basicInfo.is_multicast,
        is_reserved: basicInfo.is_reserved,
        security_level: 'unknown'
      };
      
      // Determine security level
      if (basicInfo.is_private) {
        securityAnalysis.security_level = 'private';
      } else if (basicInfo.is_loopback) {
        securityAnalysis.security_level = 'loopback';
      } else if (basicInfo.is_multicast) {
        securityAnalysis.security_level = 'multicast';
      } else if (basicInfo.is_reserved) {
        securityAnalysis.security_level = 'reserved';
      } else {
        securityAnalysis.security_level = 'public';
      }
      
      return securityAnalysis;
      
    } catch (error) {
      return {
        ip_address: ip,
        error: error.message,
        security_level: 'error'
      };
    }
  }
  
  // Test IPs
  const testIps = ['8.8.8.8', '192.168.1.1', '127.0.0.1', '224.0.0.1', '0.0.0.0'];
  
  console.log('IP Security Analysis Results:');
  for (const ip of testIps) {
    const analysis = analyzeIpSecurity(ip);
    console.log(`\n${ip}:`);
    console.log(`  Security Level: ${analysis.security_level}`);
    console.log(`  Private: ${analysis.is_private || 'N/A'}`);
    console.log(`  Global: ${analysis.is_global || 'N/A'}`);
  }
}

async function main() {
  console.log('🚀 IPDS Node.js API Usage Examples');
  console.log('='.repeat(50));
  
  try {
    // Basic IP analysis
    await basicIpAnalysis();
    
    // Network analysis
    await networkAnalysis();
    
    // Batch processing
    await batchProcessing();
    
    // Custom analysis
    await customAnalysis();
    
    console.log('\n✅ All examples completed successfully!');
    
  } catch (error) {
    console.log(`\n❌ Unexpected error occurred: ${error.message}`);
  }
}

if (require.main === module) {
  main().catch(console.error);
}
