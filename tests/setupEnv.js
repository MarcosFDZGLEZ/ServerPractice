// Set environment variables BEFORE any module loading
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes';
process.env.JWT_EXPIRE = '24h';
process.env.SMTP_HOST = 'localhost';
process.env.SMTP_PORT = '1025';
process.env.SMTP_USER = 'test';
process.env.SMTP_PASS = 'test';
