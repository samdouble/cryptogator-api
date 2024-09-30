declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BASE_URL: string;
      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;
      MONGO_URL: string;
      NODE_ENV: 'development' | 'production';
    }
  }
}

export {};
