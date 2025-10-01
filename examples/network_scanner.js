#!/usr/bin/env node

/**
 * IPDS Network Scanner Example
 * This script demonstrates how to use IPDS for network scanning and analysis.
 */

const fs = require('fs');
const { IPInfo, IPValidator } = require('../dist/index.js');

class NetworkScanner {
  constructor() {
    this.validator = new IPValidator();
    this.results = [];
  }

  async scanNetworkRange(networkCidr) {
    console.log(`Starting network scan: ${networkCidr}`);
    
    try {
      // Parse CIDR notation
      const [networkAddr, prefixLength] = networkCidr.split('/');
      const networkNum = this.ipToNumber(networkAddr);
      const hostBits = 32 - parseInt(prefixLength);
      const totalAddresses = Math.pow(2, hostBits);
      const usableAddresses = totalAddresses - 2;
      
      console.log('Network Information:');
      console.log(`  - Network Address: ${networkAddr}`);
      console.log(`  - Broadcast: ${this.calculateBroadcast(networkAddr, parseInt(prefixLength))}`);
      console.log(`  - Total Hosts: ${usableAddresses}`);
      console.log(`  - Subnet Mask: ${this.cidrToSubnetMask(parseInt(prefixLength))}`);
      console.log();
      
      // Scan first 10 hosts
      const hosts = this.generateHosts(networkAddr, parseInt(prefixLength), 10);
      
      for (let i = 0; i < hosts.length; i++) {
        const ip = hosts[i];
        console.log(`Scanning... (${i + 1}/${hosts.length}) ${ip}`);
        
        try {
          const ipInfo = new IPInfo(ip);
          const result = {
            ip_address: ip,
            basic_info: ipInfo.getBasicInfo(),
            network_info: await ipInfo.getNetworkInfo()
          };
          this.results.push(result);
          
        } catch (error) {
          console.log(`  ❌ Error: ${error.message}`);
          this.results.push({
            ip_address: ip,
            error: error.message
          });
        }
      }
      
      return this.results;
      
    } catch (error) {
      console.log(`❌ Network Scan Error: ${error.message}`);
      return [];
    }
  }

  analyzeNetworkSecurity() {
    if (this.results.length === 0) {
      return { error: 'No scan results available.' };
    }
    
    const analysis = {
      total_scanned: this.results.length,
      private_ips: 0,
      public_ips: 0,
      loopback_ips: 0,
      multicast_ips: 0,
      reserved_ips: 0,
      error_count: 0,
      network_types: {},
      asn_distribution: {}
    };
    
    for (const result of this.results) {
      if (result.error) {
        analysis.error_count++;
        continue;
      }
      
      const basicInfo = result.basic_info || {};
      const networkInfo = result.network_info || {};
      
      // IP type classification
      if (basicInfo.is_private) {
        analysis.private_ips++;
      } else if (basicInfo.is_global) {
        analysis.public_ips++;
      }
      
      if (basicInfo.is_loopback) {
        analysis.loopback_ips++;
      }
      
      if (basicInfo.is_multicast) {
        analysis.multicast_ips++;
      }
      
      if (basicInfo.is_reserved) {
        analysis.reserved_ips++;
      }
      
      // Network type classification
      const ipType = networkInfo.ip_type || 'Unknown';
      analysis.network_types[ipType] = (analysis.network_types[ipType] || 0) + 1;
      
      // ASN distribution
      const asn = networkInfo.asn;
      if (asn) {
        analysis.asn_distribution[asn] = (analysis.asn_distribution[asn] || 0) + 1;
      }
    }
    
    return analysis;
  }

  generateReport(outputFile = 'network_scan_report.json') {
    const report = {
      scan_results: this.results,
      security_analysis: this.analyzeNetworkSecurity(),
      summary: this.generateSummary()
    };
    
    fs.writeFileSync(outputFile, JSON.stringify(report, null, 2));
    console.log(`✅ Report saved to ${outputFile}.`);
    return report;
  }

  generateSummary() {
    if (this.results.length === 0) {
      return { error: 'No scan results available.' };
    }
    
    const successfulScans = this.results.filter(r => !r.error);
    
    return {
      total_ips: this.results.length,
      successful_scans: successfulScans.length,
      failed_scans: this.results.length - successfulScans.length,
      success_rate: `${((successfulScans.length / this.results.length) * 100).toFixed(1)}%`
    };
  }

  // Helper methods
  ipToNumber(ip) {
    const parts = ip.split('.').map(Number);
    return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
  }

  numberToIP(num) {
    return [
      (num >>> 24) & 0xFF,
      (num >>> 16) & 0xFF,
      (num >>> 8) & 0xFF,
      num & 0xFF
    ].join('.');
  }

  cidrToSubnetMask(cidr) {
    const mask = (0xFFFFFFFF << (32 - cidr)) >>> 0;
    return this.numberToIP(mask);
  }

  calculateBroadcast(networkAddr, prefixLength) {
    const networkNum = this.ipToNumber(networkAddr);
    const hostBits = 32 - prefixLength;
    const broadcastNum = networkNum | ((1 << hostBits) - 1);
    return this.numberToIP(broadcastNum);
  }

  generateHosts(networkAddr, prefixLength, maxHosts) {
    const networkNum = this.ipToNumber(networkAddr);
    const hostBits = 32 - prefixLength;
    const totalHosts = Math.pow(2, hostBits) - 2;
    const hostsToScan = Math.min(maxHosts, totalHosts);
    const hosts = [];
    
    for (let i = 1; i <= hostsToScan; i++) {
      const hostNum = networkNum + i;
      hosts.push(this.numberToIP(hostNum));
    }
    
    return hosts;
  }
}

async function main() {
  console.log('IPDS Network Scanner');
  console.log('='.repeat(50));
  
  const scanner = new NetworkScanner();
  
  const testNetworks = [
    '192.168.1.0/24',    // Common home network
    '10.0.0.0/24',       // Class A private
    '172.16.0.0/24',     // Class B private
  ];
  
  for (const network of testNetworks) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Network Scan: ${network}`);
    console.log(`${'='.repeat(60)}`);
    
    const results = await scanner.scanNetworkRange(network);
    
    if (results.length > 0) {
      const analysis = scanner.analyzeNetworkSecurity();
      
      console.log(`\n📊 Scan Results Summary:`);
      console.log(`  - Total Scanned IPs: ${analysis.total_scanned}`);
      console.log(`  - Private IPs: ${analysis.private_ips}`);
      console.log(`  - Public IPs: ${analysis.public_ips}`);
      console.log(`  - Loopback IPs: ${analysis.loopback_ips}`);
      console.log(`  - Multicast IPs: ${analysis.multicast_ips}`);
      console.log(`  - Reserved IPs: ${analysis.reserved_ips}`);
      console.log(`  - Errors: ${analysis.error_count}`);
      
      if (Object.keys(analysis.asn_distribution).length > 0) {
        console.log(`\n🌐 ASN Distribution:`);
        for (const [asn, count] of Object.entries(analysis.asn_distribution)) {
          console.log(`  - ${asn}: ${count} IPs`);
        }
      }
    }
    
    console.log(`\n${'-'.repeat(60)}`);
  }
  
  console.log(`\nFinal report generating...`);
  const report = scanner.generateReport('final_network_scan_report.json');
  
  console.log(`\n✅ Network scan completed!`);
  console.log(`Report: final_network_scan_report.json`);
}

if (require.main === module) {
  main().catch(console.error);
}
