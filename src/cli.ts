#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs';
import { IPInfo } from './core/ip-info';
import { IPValidator } from './utils/validation';

const program = new Command();

program
  .name('ipds')
  .description('IP Data Service - Comprehensive IP information lookup tool')
  .version('1.0.1');

program
  .argument('[ip-address]', 'IP address to analyze')
  .option('-f, --file <file>', 'File containing list of IP addresses (one per line)')
  .option('-o, --output <file>', 'Output file to save results (JSON format)')
  .option('--format <format>', 'Output format (json, yaml, csv)', 'json')
  .option('--basic-only', 'Show only basic IP information')
  .option('--asn-only', 'Show only ASN information')
  .option('--geo-only', 'Show only geolocation information')
  .option('--whois-only', 'Show only WHOIS information')
  .option('--network-only', 'Show only network information (subnet mask, network range, etc.)')
  .option('--datacenter-only', 'Show only datacenter detection information')
  .option('--geo-service <service>', 'Geolocation service (ipapi, ipinfo)', 'ipapi')
  .option('--asn-service <service>', 'ASN service (ipapi, ipinfo, hackertarget)', 'ipapi')
  .option('--verbose', 'Verbose output')
  .option('--quiet', 'Quiet output')
  .action(async (ipAddress, options) => {
    try {
      if (options.file) {
        await processFile(options);
      } else if (ipAddress) {
        await processSingleIp(ipAddress, options);
      } else {
        program.help();
      }
    } catch (error) {
      if (!options.quiet) {
        console.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
      }
      process.exit(1);
    }
  });

async function processSingleIp(ipAddress: string, options: any): Promise<void> {
  const validator = new IPValidator();
  
  if (!validator.isValid(ipAddress)) {
    throw new Error(`Invalid IP address: ${ipAddress}`);
  }

  const ipInfo = new IPInfo(ipAddress);
  let result: any;

  if (options.basicOnly) {
    result = ipInfo.getBasicInfo();
  } else if (options.asnOnly) {
    result = await ipInfo.getAsnInfo();
  } else if (options.geoOnly) {
    result = await ipInfo.getGeolocation();
  } else if (options.whoisOnly) {
    result = await ipInfo.getWhoisInfo();
  } else if (options.networkOnly) {
    result = await ipInfo.getNetworkInfo();
  } else if (options.datacenterOnly) {
    result = await getDatacenterInfo(ipAddress);
  } else {
    result = await ipInfo.getAllInfo();
  }

  outputResult(result, options);
}

async function processFile(options: any): Promise<void> {
  try {
    const fileContent = fs.readFileSync(options.file, 'utf8');
    const ipAddresses = fileContent.split('\n').map(line => line.trim()).filter(line => line);
    
    if (ipAddresses.length === 0) {
      throw new Error('No IP addresses found in file');
    }

    const results: any[] = [];
    const validator = new IPValidator();

    for (const ip of ipAddresses) {
      if (!validator.isValid(ip)) {
        if (options.verbose) {
          console.error(chalk.yellow(`Skipping invalid IP: ${ip}`));
        }
        continue;
      }

      try {
        const ipInfo = new IPInfo(ip);
        let result: any;

        if (options.basicOnly) {
          result = ipInfo.getBasicInfo();
        } else if (options.asnOnly) {
          result = await ipInfo.getAsnInfo();
        } else if (options.geoOnly) {
          result = await ipInfo.getGeolocation();
        } else if (options.whoisOnly) {
          result = await ipInfo.getWhoisInfo();
        } else if (options.networkOnly) {
          result = await ipInfo.getNetworkInfo();
        } else if (options.datacenterOnly) {
          result = await getDatacenterInfo(ip);
        } else {
          result = await ipInfo.getAllInfo();
        }

        results.push(result);
      } catch (error) {
        if (options.verbose) {
          console.error(chalk.yellow(`Error processing ${ip}: ${error instanceof Error ? error.message : String(error)}`));
        }
        continue;
      }
    }

    if (options.output) {
      fs.writeFileSync(options.output, JSON.stringify(results, null, 2));
      if (!options.quiet) {
        console.log(chalk.green(`Results saved to ${options.output}`));
      }
    } else {
      for (const result of results) {
        console.log(JSON.stringify(result, null, 2));
        console.log();
      }
    }
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      throw new Error(`File not found: ${options.file}`);
    }
    throw error;
  }
}

async function getDatacenterInfo(ip: string): Promise<any> {
  try {
    const ipInfo = new IPInfo(ip);
    const geoData = await ipInfo.getGeolocation();
    const isp = (geoData.isp || '').toLowerCase();
    const org = (geoData.org || '').toLowerCase();
    
    const isDatacenter = ['amazon', 'aws', 'google', 'microsoft', 'azure', 'cloudflare', 'hosting', 'datacenter', 'cloud']
      .some(word => `${isp} ${org}`.includes(word));
    
    return { is_datacenter: isDatacenter };
  } catch {
    return { is_datacenter: false };
  }
}

function outputResult(result: any, options: any): void {
  if (options.output) {
    fs.writeFileSync(options.output, JSON.stringify(result, null, 2));
    if (!options.quiet) {
      console.log(chalk.green(`Results saved to ${options.output}`));
    }
  } else {
    console.log(JSON.stringify(result, null, 2));
  }
}

program.parse();
