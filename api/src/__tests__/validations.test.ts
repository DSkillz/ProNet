import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  createPostSchema,
  experienceSchema,
  educationSchema,
} from '../lib/validations';

describe('Validation Schemas', () => {
  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'securePassword123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'securePassword123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'short',
        firstName: 'John',
        lastName: 'Doe',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing fields', () => {
      const invalidData = {
        email: 'test@example.com',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing email', () => {
      const invalidData = {
        password: 'password123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('updateProfileSchema', () => {
    it('should validate partial profile update', () => {
      const validData = {
        firstName: 'Jane',
        headline: 'Software Engineer',
      };

      const result = updateProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept empty object (all optional)', () => {
      const result = updateProfileSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should validate website URL', () => {
      const validData = {
        website: 'https://example.com',
      };

      const result = updateProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('createPostSchema', () => {
    it('should validate post with content only', () => {
      const validData = {
        content: 'This is a test post',
      };

      const result = createPostSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate post with visibility', () => {
      const validData = {
        content: 'This is a private post',
        visibility: 'PRIVATE',
      };

      const result = createPostSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty content', () => {
      const invalidData = {
        content: '',
      };

      const result = createPostSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('experienceSchema', () => {
    it('should validate complete experience', () => {
      const validData = {
        title: 'Software Engineer',
        company: 'Tech Corp',
        location: 'Paris, France',
        startDate: '2022-01-01',
        current: true,
        description: 'Working on exciting projects',
      };

      const result = experienceSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate minimal experience', () => {
      const validData = {
        title: 'Developer',
        company: 'Startup',
        startDate: '2023-06-01',
      };

      const result = experienceSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        title: 'Developer',
        // missing company and startDate
      };

      const result = experienceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('educationSchema', () => {
    it('should validate complete education', () => {
      const validData = {
        school: 'University of Technology',
        degree: 'Master',
        fieldOfStudy: 'Computer Science',
        startDate: '2018-09-01',
        endDate: '2020-06-30',
      };

      const result = educationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate minimal education', () => {
      const validData = {
        school: 'Tech School',
      };

      const result = educationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});
