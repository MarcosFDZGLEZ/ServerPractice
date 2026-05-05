process.env.NODE_ENV = 'test';

// Security - Use a unique string for local testing
process.env.JWT_SECRET = 'your-placeholder-secret-here';
process.env.JWT_EXPIRE = '24h';

// Email Configuration (e.g., for Mailtrap or local testing)
process.env.SMTP_HOST = 'localhost';
process.env.SMTP_PORT = '1025';
process.env.SMTP_USER = 'your-test-user';
process.env.SMTP_PASS = 'your-test-password';