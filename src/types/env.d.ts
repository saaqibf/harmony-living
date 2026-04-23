// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare namespace NodeJS {
  interface ProcessEnv {
    // --- Database ---
    DATABASE_URL: string;

    // --- App ---
    NEXT_PUBLIC_APP_URL: string;
    NODE_ENV: 'development' | 'production' | 'test';

    // --- AWS Cognito ---
    COGNITO_USER_POOL_ID: string;
    COGNITO_CLIENT_ID: string;
    COGNITO_CLIENT_SECRET: string;
    COGNITO_REGION: string;
    COGNITO_DOMAIN: string;

    // --- AWS S3 ---
    AWS_S3_BUCKET: string;
    AWS_S3_REGION: string;
    AWS_ACCESS_KEY_ID: string;
    AWS_SECRET_ACCESS_KEY: string;

    // --- Mapbox ---
    NEXT_PUBLIC_MAPBOX_TOKEN: string;

    // --- Pusher ---
    PUSHER_APP_ID: string;
    PUSHER_KEY: string;
    PUSHER_SECRET: string;
    PUSHER_CLUSTER: string;
    NEXT_PUBLIC_PUSHER_KEY: string;
    NEXT_PUBLIC_PUSHER_CLUSTER: string;

    // --- Auth / Session ---
    AUTH_SECRET: string;
  }
}

export {};
