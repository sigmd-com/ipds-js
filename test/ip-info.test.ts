import { IPInfo } from '../src/core/ip-info';
import { IPValidator } from '../src/utils/validation';

describe('IPInfo', () => {
  describe('Basic Info', () => {
    test('should identify private IP correctly', () => {
      const ipInfo = new IPInfo('192.168.1.1');
      const basicInfo = ipInfo.getBasicInfo();
      
      expect(basicInfo.is_private).toBe(true);
      expect(basicInfo.is_global).toBe(false);
      expect(basicInfo.version).toBe(4);
    });

    test('should identify public IP correctly', () => {
      const ipInfo = new IPInfo('8.8.8.8');
      const basicInfo = ipInfo.getBasicInfo();
      
      expect(basicInfo.is_private).toBe(false);
      expect(basicInfo.is_global).toBe(true);
      expect(basicInfo.version).toBe(4);
    });

    test('should identify loopback IP correctly', () => {
      const ipInfo = new IPInfo('127.0.0.1');
      const basicInfo = ipInfo.getBasicInfo();
      
      expect(basicInfo.is_loopback).toBe(true);
      expect(basicInfo.is_private).toBe(false);
    });

    test('should identify multicast IP correctly', () => {
      const ipInfo = new IPInfo('224.0.0.1');
      const basicInfo = ipInfo.getBasicInfo();
      
      expect(basicInfo.is_multicast).toBe(true);
      expect(basicInfo.is_global).toBe(false);
    });
  });

  describe('Network Info', () => {
    test('should get private network info for Class C', async () => {
      const ipInfo = new IPInfo('192.168.1.1');
      const networkInfo = await ipInfo.getNetworkInfo();
      
      expect(networkInfo.network_address).toBe('192.168.0.0');
      expect(networkInfo.subnet_mask).toBe('255.255.0.0');
      expect(networkInfo.subnet_mask_cidr).toBe('/16');
      expect(networkInfo.is_private).toBe(true);
    });

    test('should get private network info for Class A', async () => {
      const ipInfo = new IPInfo('10.1.1.1');
      const networkInfo = await ipInfo.getNetworkInfo();
      
      expect(networkInfo.network_address).toBe('10.0.0.0');
      expect(networkInfo.subnet_mask).toBe('255.0.0.0');
      expect(networkInfo.subnet_mask_cidr).toBe('/8');
      expect(networkInfo.is_private).toBe(true);
    });

    test('should get private network info for Class B', async () => {
      const ipInfo = new IPInfo('172.16.1.1');
      const networkInfo = await ipInfo.getNetworkInfo();
      
      expect(networkInfo.network_address).toBe('172.16.0.0');
      expect(networkInfo.subnet_mask).toBe('255.240.0.0');
      expect(networkInfo.subnet_mask_cidr).toBe('/12');
      expect(networkInfo.is_private).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should throw error for invalid IP', () => {
      expect(() => new IPInfo('invalid-ip')).toThrow('Invalid IP address: invalid-ip');
    });

    test('should throw error for empty IP', () => {
      expect(() => new IPInfo('')).toThrow('Invalid IP address: ');
    });
  });
});

describe('IPValidator', () => {
  test('should validate correct IP addresses', () => {
    const validator = new IPValidator();
    
    expect(validator.isValid('192.168.1.1')).toBe(true);
    expect(validator.isValid('8.8.8.8')).toBe(true);
    expect(validator.isValid('127.0.0.1')).toBe(true);
  });

  test('should reject invalid IP addresses', () => {
    const validator = new IPValidator();
    
    expect(validator.isValid('256.1.1.1')).toBe(false);
    expect(validator.isValid('192.168.1')).toBe(false);
    expect(validator.isValid('not-an-ip')).toBe(false);
  });

  test('should identify private IPs correctly', () => {
    const validator = new IPValidator();
    
    expect(validator.isPrivate('192.168.1.1')).toBe(true);
    expect(validator.isPrivate('10.1.1.1')).toBe(true);
    expect(validator.isPrivate('172.16.1.1')).toBe(true);
    expect(validator.isPrivate('8.8.8.8')).toBe(false);
  });
});
