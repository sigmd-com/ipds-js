import { IPConverter } from '../src/utils/conversion';

describe('IPConverter', () => {
  let converter: IPConverter;

  beforeEach(() => {
    converter = new IPConverter();
  });

  describe('IP to Number Conversion', () => {
    test('should convert IP to number correctly', () => {
      const testCases = [
        { ip: '0.0.0.0', expected: 0 },
        { ip: '127.0.0.1', expected: 2130706433 },
        { ip: '192.168.1.1', expected: 3232235777 },
        { ip: '255.255.255.255', expected: 4294967295 }
      ];

      testCases.forEach(({ ip, expected }) => {
        expect(converter.ipToNumber(ip)).toBe(expected);
      });
    });

    test('should convert number to IP correctly', () => {
      const testCases = [
        { num: 0, expected: '0.0.0.0' },
        { num: 2130706433, expected: '127.0.0.1' },
        { num: 3232235777, expected: '192.168.1.1' },
        { num: 4294967295, expected: '255.255.255.255' }
      ];

      testCases.forEach(({ num, expected }) => {
        expect(converter.numberToIP(num)).toBe(expected);
      });
    });
  });

  describe('CIDR to Subnet Mask Conversion', () => {
    test('should convert CIDR to subnet mask correctly', () => {
      const testCases = [
        { cidr: 8, expected: '255.0.0.0' },
        { cidr: 16, expected: '255.255.0.0' },
        { cidr: 24, expected: '255.255.255.0' },
        { cidr: 32, expected: '255.255.255.255' }
      ];

      testCases.forEach(({ cidr, expected }) => {
        expect(converter.cidrToSubnetMask(cidr)).toBe(expected);
      });
    });

    test('should convert subnet mask to CIDR correctly', () => {
      const testCases = [
        { mask: '255.0.0.0', expected: 8 },
        { mask: '255.255.0.0', expected: 16 },
        { mask: '255.255.255.0', expected: 24 },
        { mask: '255.255.255.255', expected: 32 }
      ];

      testCases.forEach(({ mask, expected }) => {
        expect(converter.subnetMaskToCidr(mask)).toBe(expected);
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle boundary values', () => {
      expect(converter.ipToNumber('0.0.0.0')).toBe(0);
      expect(converter.ipToNumber('255.255.255.255')).toBe(4294967295);
      expect(converter.numberToIP(0)).toBe('0.0.0.0');
      expect(converter.numberToIP(4294967295)).toBe('255.255.255.255');
    });

    test('should handle single octet values', () => {
      expect(converter.ipToNumber('1.0.0.0')).toBe(16777216);
      expect(converter.ipToNumber('0.1.0.0')).toBe(65536);
      expect(converter.ipToNumber('0.0.1.0')).toBe(256);
      expect(converter.ipToNumber('0.0.0.1')).toBe(1);
    });
  });
});
