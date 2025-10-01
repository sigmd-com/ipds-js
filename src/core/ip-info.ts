import { IPValidator } from '../utils/validation';
import { IPConverter } from '../utils/conversion';
import { Geolocation } from './geolocation';
import { ASN } from './asn';
import { Whois } from './whois';

export class IPInfo {
  private ipAddress: string;
  private validator: IPValidator;
  private converter: IPConverter;
  private geolocation: Geolocation;
  private asn: ASN;
  private whois: Whois;

  constructor(ipAddress: string) {
    this.ipAddress = ipAddress;
    this.validator = new IPValidator();
    this.converter = new IPConverter();
    this.geolocation = new Geolocation();
    this.asn = new ASN();
    this.whois = new Whois();

    if (!this.validator.isValid(ipAddress)) {
      throw new Error(`Invalid IP address: ${ipAddress}`);
    }
  }

  async getAllInfo(): Promise<any> {
    const info = {
      ip_address: this.ipAddress,
      basic_info: this.getBasicInfo(),
      network_info: await this.getNetworkInfo(),
      geolocation: await this.getGeolocation(),
      asn: await this.getAsnInfo(),
      whois: await this.getWhoisInfo()
    };
    return info;
  }

  getBasicInfo(): any {
    const parts = this.ipAddress.split('.').map(Number);
    const ipNum = this.converter.ipToNumber(this.ipAddress);

    return {
      version: 4,
      is_private: this.validator.isPrivate(this.ipAddress),
      is_global: !this.validator.isPrivate(this.ipAddress) && !this.isSpecialAddress(),
      is_multicast: parts[0] >= 224 && parts[0] <= 239,
      is_loopback: parts[0] === 127,
      is_link_local: parts[0] === 169 && parts[1] === 254,
      is_reserved: this.isReservedAddress(),
      compressed: this.ipAddress,
      exploded: this.ipAddress
    };
  }

  async getGeolocation(): Promise<any> {
    return await this.geolocation.lookup(this.ipAddress);
  }

  async getAsnInfo(): Promise<any> {
    return await this.asn.lookup(this.ipAddress);
  }

  async getWhoisInfo(): Promise<any> {
    return await this.whois.lookup(this.ipAddress);
  }

  async getNetworkInfo(): Promise<any> {
    try {
      if (this.validator.isPrivate(this.ipAddress)) {
        return this.getPrivateNetworkInfo();
      } else {
        return await this.asn.getNetworkInfoForPublicIp(this.ipAddress);
      }
    } catch (error) {
      return { error: `Failed to get network info: ${error}` };
    }
  }

  private getPrivateNetworkInfo(): any {
    let network: string;
    let prefixLength: number;

    if (this.validator.isClassAPrivate(this.ipAddress)) {
      network = '10.0.0.0';
      prefixLength = 8;
    } else if (this.validator.isClassBPrivate(this.ipAddress)) {
      network = '172.16.0.0';
      prefixLength = 12;
    } else if (this.validator.isClassCPrivate(this.ipAddress)) {
      network = '192.168.0.0';
      prefixLength = 16;
    } else {
      return { error: 'Unknown private network type' };
    }

    const subnetMask = this.converter.cidrToSubnetMask(prefixLength);
    const totalAddresses = Math.pow(2, 32 - prefixLength);
    const usableAddresses = totalAddresses - 2;
    const broadcastAddress = this.calculateBroadcast(network, prefixLength);

    return {
      network_address: network,
      subnet_mask: subnetMask,
      subnet_mask_cidr: `/${prefixLength}`,
      broadcast_address: broadcastAddress,
      total_addresses: totalAddresses,
      usable_addresses: usableAddresses,
      prefix_length: prefixLength,
      network_range: `${network}/${prefixLength}`,
      is_private: true,
      ip_type: 'Private'
    };
  }

  private isSpecialAddress(): boolean {
    const parts = this.ipAddress.split('.').map(Number);
    return (
      parts[0] === 0 || // 0.0.0.0/8
      (parts[0] === 127) || // 127.0.0.0/8
      (parts[0] === 169 && parts[1] === 254) || // 169.254.0.0/16
      (parts[0] >= 224 && parts[0] <= 239) || // 224.0.0.0/4
      (parts[0] >= 240 && parts[0] <= 255) // 240.0.0.0/4
    );
  }

  private isReservedAddress(): boolean {
    const parts = this.ipAddress.split('.').map(Number);
    return (
      parts[0] === 0 || // 0.0.0.0/8
      (parts[0] >= 240 && parts[0] <= 255) // 240.0.0.0/4
    );
  }

  private calculateBroadcast(networkAddr: string, prefixLength: number): string {
    const networkNum = this.converter.ipToNumber(networkAddr);
    const hostBits = 32 - prefixLength;
    const broadcastNum = networkNum | ((1 << hostBits) - 1);
    return this.converter.numberToIP(broadcastNum);
  }

  toString(): string {
    return `IPInfo(${this.ipAddress})`;
  }
}
