import { IPValidator } from '../src/utils/validation';

describe('IPValidator', () => {
  let validator: IPValidator;

  beforeEach(() => {
    validator = new IPValidator();
  });

  describe('IPv4 Validation', () => {
    test('should validate correct IPv4 addresses', () => {
      const validIps = [
        '192.168.1.1',
        '8.8.8.8',
        '127.0.0.1',
        '0.0.0.0',
        '255.255.255.255'
      ];

      validIps.forEach(ip => {
        expect(validator.isValid(ip)).toBe(true);
      });
    });

    test('should reject invalid IPv4 addresses', () => {
      const invalidIps = [
        '256.1.1.1',
        '192.168.1',
        '192.168.1.1.1',
        'not.an.ip',
        '',
        ' '
      ];

      invalidIps.forEach(ip => {
        expect(validator.isValid(ip)).toBe(false);
      });
    });
  });

  describe('Private IP Detection', () => {
    test('should identify private IPs correctly', () => {
      const privateIps = [
        '10.0.0.1',
        '172.16.0.1',
        '192.168.1.1'
      ];

      privateIps.forEach(ip => {
        expect(validator.isPrivate(ip)).toBe(true);
      });
    });

    test('should identify public IPs correctly', () => {
      const publicIps = [
        '8.8.8.8',
        '1.1.1.1',
        '208.67.222.222'
      ];

      publicIps.forEach(ip => {
        expect(validator.isPrivate(ip)).toBe(false);
      });
    });
  });

  describe('Class-based Private Range Detection', () => {
    test('should identify Class A private IPs', () => {
      expect(validator.isClassAPrivate('10.0.0.1')).toBe(true);
      expect(validator.isClassAPrivate('10.255.255.255')).toBe(true);
      expect(validator.isClassAPrivate('11.0.0.1')).toBe(false);
    });

    test('should identify Class B private IPs', () => {
      expect(validator.isClassBPrivate('172.16.0.1')).toBe(true);
      expect(validator.isClassBPrivate('172.31.255.255')).toBe(true);
      expect(validator.isClassBPrivate('172.15.0.1')).toBe(false);
      expect(validator.isClassBPrivate('172.32.0.1')).toBe(false);
    });

    test('should identify Class C private IPs', () => {
      expect(validator.isClassCPrivate('192.168.0.1')).toBe(true);
      expect(validator.isClassCPrivate('192.168.255.255')).toBe(true);
      expect(validator.isClassCPrivate('192.167.0.1')).toBe(false);
      expect(validator.isClassCPrivate('192.169.0.1')).toBe(false);
    });
  });
});
