import dns from 'node:dns';
import mongoose from 'mongoose';

const DEFAULT_PUBLIC_DNS_SERVERS = ['1.1.1.1', '8.8.8.8'];

const isLoopbackDnsServer = (server = '') =>
  server === '127.0.0.1' || server === '::1' || server.startsWith('127.');

const getFallbackDnsServers = () => {
  const configuredServers = (process.env.MONGO_DNS_SERVERS || '')
    .split(',')
    .map((server) => server.trim())
    .filter(Boolean);

  return configuredServers.length ? configuredServers : DEFAULT_PUBLIC_DNS_SERVERS;
};

const shouldRetryWithDnsFallback = (mongoUri, error) => {
  if (!mongoUri?.startsWith('mongodb+srv://')) {
    return false;
  }

  if (error?.code !== 'ECONNREFUSED' || error?.syscall !== 'querySrv') {
    return false;
  }

  const currentDnsServers = dns.getServers();

  return currentDnsServers.length > 0 && currentDnsServers.every(isLoopbackDnsServer);
};

const buildMongooseConnectOptions = () => ({
  autoIndex: false,
  family: 4,
  serverSelectionTimeoutMS: 10000,
});

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI?.trim();

  try {
    await mongoose.connect(mongoUri, buildMongooseConnectOptions());
    console.log('MongoDB connected successfully.');
  } catch (error) {
    if (shouldRetryWithDnsFallback(mongoUri, error)) {
      const fallbackDnsServers = getFallbackDnsServers();

      try {
        dns.setServers(fallbackDnsServers);
        console.warn(
          `MongoDB SRV lookup failed with local DNS. Retrying with ${fallbackDnsServers.join(', ')}.`
        );

        await mongoose.connect(mongoUri, buildMongooseConnectOptions());
        console.log('MongoDB connected successfully after DNS fallback.');
        return;
      } catch (retryError) {
        console.error(`MongoDB connection failed after DNS fallback: ${retryError.message}`);
        process.exit(1);
      }
    }

    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};
