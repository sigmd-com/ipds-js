import axios from 'axios';

export class ASN {
  private baseUrls = {
    ipapi: 'http://ip-api.com/json/',
    ipinfo: 'https://ipinfo.io/',
    hackertarget: 'https://api.hackertarget.com/aslookup/'
  };

  async lookup(ip: string, service: string = 'ipapi'): Promise<any> {
    try {
      if (service === 'ipapi') {
        return await this.lookupIpapi(ip);
      } else if (service === 'ipinfo') {
        return await this.lookupIpinfo(ip);
      } else if (service === 'hackertarget') {
        return await this.lookupHackertarget(ip);
      } else {
        throw new Error(`Unknown service: ${service}`);
      }
    } catch (error) {
      return { error: `ASN lookup failed: ${error}` };
    }
  }

  private async lookupIpapi(ip: string): Promise<any> {
    const response = await axios.get(`${this.baseUrls.ipapi}${ip}`, { timeout: 10000 });
    const data = response.data;

    const asParts = data.as ? data.as.split(' ') : [];
    const asNumber = asParts[0] || '';
    const asName = asParts.slice(1).join(' ') || '';

    return {
      as_number: asNumber,
      as_name: asName,
      isp: data.isp,
      org: data.org,
      country: data.country,
      country_code: data.countryCode
    };
  }

  private async lookupIpinfo(ip: string): Promise<any> {
    const response = await axios.get(`${this.baseUrls.ipinfo}${ip}/json`, { timeout: 10000 });
    const data = response.data;

    const asParts = data.org ? data.org.split(' ') : [];
    const asNumber = asParts[0] || '';
    const asName = asParts.slice(1).join(' ') || '';

    return {
      as_number: asNumber,
      as_name: asName,
      isp: asName,
      org: data.org,
      country: data.country
    };
  }

  private async lookupHackertarget(ip: string): Promise<any> {
    const response = await axios.get(`${this.baseUrls.hackertarget}${ip}`, { timeout: 10000 });
    const data = response.data;

    if (data.includes('No results found')) {
      return { error: 'No ASN information found' };
    }

    const lines = data.split('\n');
    const asnLine = lines.find((line: string) => line.includes('AS'));
    
    if (!asnLine) {
      return { error: 'No ASN information found' };
    }

    const parts = asnLine.split(' ');
    const asNumber = parts.find((part: string) => part.startsWith('AS')) || '';
    const asName = parts.slice(1).join(' ') || '';

    return {
      as_number: asNumber,
      as_name: asName,
      isp: asName,
      org: asName
    };
  }

  async getAsnNetworks(asNumber: string): Promise<any> {
    try {
      const response = await axios.get(`https://stat.ripe.net/data/announced-prefixes/data.json?resource=${asNumber}`, { timeout: 10000 });
      const data = response.data;

      if (data.status === 'ok' && data.data && data.data.prefixes) {
        return {
          networks: data.data.prefixes.map((p: any) => p.prefix),
          as_number: asNumber
        };
      }

      return { error: 'No network prefixes found' };
    } catch (error) {
      return { error: `Failed to get ASN networks: ${error}` };
    }
  }

  findIpNetwork(ip: string, networks: string[]): string | null {
    for (const network of networks) {
      if (this.isIpInNetwork(ip, network)) {
        return network;
      }
    }
    return null;
  }

  private isIpInNetwork(ip: string, network: string): boolean {
    try {
      const [networkAddr, prefixLength] = network.split('/');
      const ipNum = this.ipToNumber(ip);
      const networkNum = this.ipToNumber(networkAddr);
      const mask = (0xFFFFFFFF << (32 - parseInt(prefixLength))) >>> 0;
      
      return (ipNum & mask) === (networkNum & mask);
    } catch {
      return false;
    }
  }

  private ipToNumber(ip: string): number {
    const parts = ip.split('.').map(Number);
    return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
  }

  async getNetworkInfoForPublicIp(ip: string): Promise<any> {
    try {
      const asnInfo = await this.lookup(ip);
      const asNumber = asnInfo.as_number;
      
      if (!asNumber) {
        return {
          error: 'Could not determine ASN for this IP',
          ip_address: ip,
          is_private: false,
          ip_type: 'Public'
        };
      }

      const asnNetworks = await this.getAsnNetworks(asNumber);
      
      if (asnNetworks.error) {
        return {
          ip_address: ip,
          asn: asNumber,
          asn_name: asnInfo.as_name,
          is_private: false,
          ip_type: 'Public',
          note: `ASN ${asNumber} found but network details unavailable`,
          asn_networks_error: asnNetworks.error
        };
      }

      const allNetworks = asnNetworks.networks || [];
      const specificNetwork = this.findIpNetwork(ip, allNetworks);
      
      if (specificNetwork) {
        const [networkAddr, prefixLength] = specificNetwork.split('/');
        const subnetMask = this.cidrToSubnetMask(parseInt(prefixLength));
        const totalAddresses = Math.pow(2, 32 - parseInt(prefixLength));
        const usableAddresses = totalAddresses - 2;

        return {
          ip_address: ip,
          asn: asNumber,
          asn_name: asnInfo.as_name,
          network_address: networkAddr,
          subnet_mask: subnetMask,
          subnet_mask_cidr: `/${prefixLength}`,
          broadcast_address: this.calculateBroadcast(networkAddr, parseInt(prefixLength)),
          total_addresses: totalAddresses,
          usable_addresses: usableAddresses,
          prefix_length: parseInt(prefixLength),
          network_range: specificNetwork,
          is_private: false,
          ip_type: 'Public',
          note: `IP belongs to ${specificNetwork} in ASN ${asNumber}`,
          source: 'ASN-based lookup'
        };
      }

      return {
        ip_address: ip,
        asn: asNumber,
        asn_name: asnInfo.as_name,
        is_private: false,
        ip_type: 'Public',
        note: `ASN ${asNumber} found but IP not in any known network`,
        source: 'ASN-based lookup'
      };
    } catch (error) {
      return { error: `Network info lookup failed: ${error}` };
    }
  }

  private cidrToSubnetMask(cidr: number): string {
    const mask = (0xFFFFFFFF << (32 - cidr)) >>> 0;
    return this.numberToIP(mask);
  }

  private numberToIP(num: number): string {
    return [
      (num >>> 24) & 0xFF,
      (num >>> 16) & 0xFF,
      (num >>> 8) & 0xFF,
      num & 0xFF
    ].join('.');
  }

  private calculateBroadcast(networkAddr: string, prefixLength: number): string {
    const networkNum = this.ipToNumber(networkAddr);
    const hostBits = 32 - prefixLength;
    const broadcastNum = networkNum | ((1 << hostBits) - 1);
    return this.numberToIP(broadcastNum);
  }
}
