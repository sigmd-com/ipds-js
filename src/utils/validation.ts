export class IPValidator {
  isValid(ip: string): boolean {
    try {
      const parts = ip.split('.');
      if (parts.length !== 4) return false;
      
      return parts.every(part => {
        const num = parseInt(part, 10);
        return num >= 0 && num <= 255;
      });
    } catch {
      return false;
    }
  }

  isPrivate(ip: string): boolean {
    if (!this.isValid(ip)) return false;
    
    const parts = ip.split('.').map(Number);
    const [a, b] = parts;
    
    return (
      (a === 10) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168)
    );
  }

  isClassAPrivate(ip: string): boolean {
    if (!this.isValid(ip)) return false;
    return ip.startsWith('10.');
  }

  isClassBPrivate(ip: string): boolean {
    if (!this.isValid(ip)) return false;
    const parts = ip.split('.').map(Number);
    return parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31;
  }

  isClassCPrivate(ip: string): boolean {
    if (!this.isValid(ip)) return false;
    return ip.startsWith('192.168.');
  }
}
