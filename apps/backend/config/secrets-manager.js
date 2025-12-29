const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

class SecretsManager {
  constructor() {
    this.client = new SecretsManagerClient({
      region: process.env.AWS_REGION || 'ap-southeast-1',
    });
    this.secretsCache = null;
    this.cacheExpiry = null;
    this.cacheDuration = 5 * 60 * 1000; // 5 minutes
  }

  async loadSecrets() {
    if (this.secretsCache && this.cacheExpiry > Date.now()) {
      return this.secretsCache;
    }

    try {
      const response = await this.client.send(
        new GetSecretValueCommand({
          SecretId: process.env.AWS_SECRET_NAME || 'gacp-platform/production',
        }),
      );

      if (!response.SecretString) {
        throw new Error('Secret not found or empty');
      }

      this.secretsCache = JSON.parse(response.SecretString);
      this.cacheExpiry = Date.now() + this.cacheDuration;

      return this.secretsCache;
    } catch (error) {
      console.error('Failed to load secrets from AWS:', error.message);
      throw error;
    }
  }

  async initialize() {
    if (process.env.NODE_ENV === 'production' && process.env.USE_AWS_SECRETS === 'true') {
      console.log('🔐 Loading secrets from AWS Secrets Manager...');
      const secrets = await this.loadSecrets();
      Object.assign(process.env, secrets);
      console.log('✅ Secrets loaded successfully');
    } else {
      console.log('ℹ️  Using local environment variables');
    }
  }

  clearCache() {
    this.secretsCache = null;
    this.cacheExpiry = null;
  }
}

module.exports = new SecretsManager();
