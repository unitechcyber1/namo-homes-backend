// Environment variable validation
require("dotenv").config();

const requiredEnvVars = [
  'MONGO_URI',
  'PORT',
  'JWT_SECRET_ADMIN',
  'AES_SECRET_KEY',
  'REDIS_URL',
  'ACCESS_KEY',
  'SECRET_KEY',
  'REGION',
  'BUCKET_NAME',
  'EMAIL',
  'PASSWORD'
];

const optionalEnvVars = [
  'NODE_ENV',
  'ALLOWED_ORIGINS',
  'GAS_URL',
  'ADMIN_FRONTEND_URL'
];

const validateEnv = () => {
  const missing = [];
  
  requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach((varName) => {
      console.error(`   - ${varName}`);
    });
    console.error('\nPlease check your .env file and ensure all required variables are set.');
    process.exit(1);
  }

  // Warn about missing optional variables in production
  if (process.env.NODE_ENV === 'production') {
    const missingOptional = optionalEnvVars.filter((varName) => !process.env[varName]);
    if (missingOptional.length > 0) {
      console.warn('⚠️  Missing optional environment variables (recommended for production):');
      missingOptional.forEach((varName) => {
        console.warn(`   - ${varName}`);
      });
    }
  }

  console.log('✅ Environment variables validated');
};

module.exports = validateEnv;

