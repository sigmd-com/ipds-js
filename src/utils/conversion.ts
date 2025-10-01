export class IPConverter {
  ipToNumber(ip: string): number {
    const parts = ip.split('.').map(Number);
    return ((parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3]) >>> 0;
  }

  numberToIP(num: number): string {
    return [
      (num >>> 24) & 0xFF,
      (num >>> 16) & 0xFF,
      (num >>> 8) & 0xFF,
      num & 0xFF
    ].join('.');
  }

  cidrToSubnetMask(cidr: number): string {
    const mask = (0xFFFFFFFF << (32 - cidr)) >>> 0;
    return this.numberToIP(mask);
  }

  subnetMaskToCidr(mask: string): number {
    const num = this.ipToNumber(mask);
    let cidr = 0;
    let temp = num;
    
    while (temp & 0x80000000) {
      cidr++;
      temp <<= 1;
    }
    
    return cidr;
  }
}
