# IPDS - IP Data Service

A comprehensive Node.js library and CLI tool for IP address analysis, network information retrieval, and geolocation services.

## Features

- **IP Address Analysis** - Basic IP properties, validation, and classification
- **Network Information** - Subnet masks, CIDR notation, network ranges, and broadcast addresses
- **ASN Lookup** - Autonomous System Number lookup with organization details
- **Geolocation** - Country, region, city, ISP, and timezone information
- **WHOIS Data** - IP and domain WHOIS information
- **Batch Processing** - Analyze multiple IP addresses simultaneously
- **Multiple Output Formats** - JSON, YAML, and CSV export options
- **Network Scanning** - Scan network ranges and analyze security

## Installation

```bash
npm install ipds
```

## Quick Start

### Command Line Interface

```bash
# Basic IP lookup
npx ipds 8.8.8.8

# Network information only
npx ipds 8.8.8.8 --network-only

# ASN information only
npx ipds 8.8.8.8 --asn-only

# Geolocation only
npx ipds 8.8.8.8 --geo-only

# Batch processing from file
npx ipds --file ip_list.txt

# Save results to file
npx ipds 8.8.8.8 --output results.json
```

### Node.js API

```javascript
const { IPInfo } = require('ipds');

// Create IPInfo object
const ipInfo = new IPInfo('8.8.8.8');

// Get all information
const allInfo = await ipInfo.getAllInfo();
console.log(allInfo);

// Get specific information
const basicInfo = ipInfo.getBasicInfo();
const networkInfo = await ipInfo.getNetworkInfo();
const asnInfo = await ipInfo.getAsnInfo();
const geoInfo = await ipInfo.getGeolocation();
const whoisInfo = await ipInfo.getWhoisInfo();
```

## Examples

### Basic IP Analysis

```javascript
const { IPInfo } = require('ipds');

const ipInfo = new IPInfo('192.168.1.1');

// Basic properties
const basic = ipInfo.getBasicInfo();
console.log(`IP Version: IPv${basic.version}`);
console.log(`Private IP: ${basic.is_private}`);
console.log(`Global IP: ${basic.is_global}`);

// Network information
const network = await ipInfo.getNetworkInfo();
console.log(`Network Range: ${network.network_range}`);
console.log(`Subnet Mask: ${network.subnet_mask}`);
console.log(`Broadcast: ${network.broadcast_address}`);
```

### Public IP Analysis

```javascript
const { IPInfo } = require('ipds');

const ipInfo = new IPInfo('8.8.8.8');

// Get ASN information
const asnInfo = await ipInfo.getAsnInfo();
console.log(`ASN: ${asnInfo.as_number}`);
console.log(`Organization: ${asnInfo.as_name}`);

// Get geolocation
const geoInfo = await ipInfo.getGeolocation();
console.log(`Country: ${geoInfo.country}`);
console.log(`City: ${geoInfo.city}`);
console.log(`ISP: ${geoInfo.isp}`);
```

### Batch Processing

```javascript
const { IPInfo } = require('ipds');

const ipAddresses = ['8.8.8.8', '1.1.1.1', '192.168.1.1'];

const results = [];
for (const ip of ipAddresses) {
  const ipInfo = new IPInfo(ip);
  const result = {
    ip_address: ip,
    basic_info: ipInfo.getBasicInfo(),
    network_info: await ipInfo.getNetworkInfo()
  };
  results.push(result);
}

console.log(`Processed ${results.length} IP addresses`);
```

## CLI Options

```bash
ipds [IP_ADDRESS] [OPTIONS]

Options:
  --file FILE              Process IPs from file
  --output FILE            Save results to file
  --format FORMAT          Output format (json, yaml, csv)
  --basic-only             Show only basic IP information
  --network-only           Show only network information
  --asn-only               Show only ASN information
  --geo-only               Show only geolocation information
  --whois-only             Show only WHOIS information
  --datacenter-only        Show only datacenter detection information
  --geo-service SERVICE    Geolocation service (ipapi, ipinfo)
  --asn-service SERVICE    ASN service (ipapi, ipinfo, hackertarget)
  --verbose                Verbose output
  --quiet                  Quiet output
  --help                   Show help message
```

## Output Formats

### JSON (Default)
```json
{
  "ip_address": "8.8.8.8",
  "basic_info": {
    "version": 4,
    "is_private": false,
    "is_global": true,
    "is_multicast": false,
    "is_loopback": false,
    "is_link_local": false,
    "is_reserved": false
  },
  "network_info": {
    "network_address": "8.8.8.0",
    "subnet_mask": "255.255.255.0",
    "subnet_mask_cidr": "/24",
    "broadcast_address": "8.8.8.255",
    "total_addresses": 256,
    "usable_addresses": 254,
    "network_range": "8.8.8.0/24"
  },
  "asn": {
    "as_number": "AS15169",
    "as_name": "Google LLC",
    "isp": "Google LLC"
  },
  "geolocation": {
    "country": "United States",
    "country_code": "US",
    "region": "VA",
    "city": "Ashburn",
    "lat": 39.03,
    "lon": -77.5,
    "timezone": "America/New_York",
    "isp": "Google LLC"
  }
}
```

## Network Analysis

IPDS provides detailed network analysis including:

- **Subnet Mask Calculation** - Automatic subnet mask detection
- **CIDR Notation** - Network range in CIDR format
- **Broadcast Address** - Network broadcast address
- **Address Count** - Total and usable address counts
- **ASN Network Ranges** - For public IPs, finds the specific network range

### Private IP Networks

For private IPs, IPDS automatically detects the network class and provides:
- Class A (10.0.0.0/8)
- Class B (172.16.0.0/12) 
- Class C (192.168.0.0/16)

### Public IP Networks

For public IPs, IPDS:
1. Looks up the ASN (Autonomous System Number)
2. Retrieves all network prefixes announced by that ASN
3. Finds the specific network range containing the IP
4. Provides detailed subnet information

## Services Integration

IPDS integrates with multiple external services:

- **IP-API** - Primary geolocation and ASN service
- **IPInfo** - Alternative geolocation service
- **HackerTarget** - ASN lookup service
- **RIPE Stat** - ASN network prefix data

## Error Handling

IPDS includes comprehensive error handling:
- Invalid IP address validation
- Network connectivity issues
- API service failures
- Graceful degradation when services are unavailable

## Requirements

- Node.js 16.0.0+
- Internet connection for external API calls

## License

MIT License
