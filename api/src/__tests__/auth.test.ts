import { hashPassword, comparePasswords, generateAccessToken, generateRefreshToken } from '../lib/auth';
import jwt from 'jsonwebtoken';

describe('Auth Library', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testpassword123';
      const hashed = await hashPassword(password);

      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(0);
    });

    it('should produce different hashes for different passwords', async () => {
      const hash1 = await hashPassword('password1');
      const hash2 = await hashPassword('password2');

      expect(hash1).not.toBe(hash2);
    });

    it('should produce different hashes for same password (salt)', async () => {
      const password = 'samepassword';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePasswords', () => {
    it('should return true for matching password', async () => {
      const password = 'testpassword123';
      const hashed = await hashPassword(password);
      const result = await comparePasswords(password, hashed);

      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'testpassword123';
      const wrongPassword = 'wrongpassword';
      const hashed = await hashPassword(password);
      const result = await comparePasswords(wrongPassword, hashed);

      expect(result).toBe(false);
    });
  });

  describe('generateAccessToken', () => {
    it('should generate a valid JWT token', () => {
      const payload = { userId: 'test-user-id', email: 'test@example.com' };
      const token = generateAccessToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      // Decode and verify the token structure
      const decoded = jwt.decode(token) as any;
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
    });

    it('should include expiration time', () => {
      const payload = { userId: 'test-user-id', email: 'test@example.com' };
      const token = generateAccessToken(payload);
      const decoded = jwt.decode(token) as any;

      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a unique token', () => {
      const token1 = generateRefreshToken();
      const token2 = generateRefreshToken();

      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
      expect(token1).not.toBe(token2);
    });

    it('should generate a token of expected length', () => {
      const token = generateRefreshToken();

      // nanoid generates 21 character tokens by default
      expect(token.length).toBeGreaterThanOrEqual(20);
    });
  });
});
