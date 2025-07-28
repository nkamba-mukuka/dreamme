/// <reference types="vite/client" />

/**
 * Environment variables type definitions
 */
interface ImportMetaEnv {
    readonly VITE_FIREBASE_API_KEY: string;
    readonly VITE_FIREBASE_AUTH_DOMAIN: string;
    readonly VITE_FIREBASE_PROJECT_ID: string;
    readonly VITE_FIREBASE_STORAGE_BUCKET: string;
    readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
    readonly VITE_FIREBASE_APP_ID: string;
    readonly VITE_SENTRY_DSN: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

/**
 * JSX namespace augmentation for custom elements
 */
declare namespace JSX {
    interface IntrinsicElements {
        [elemName: string]: any;
    }
}
