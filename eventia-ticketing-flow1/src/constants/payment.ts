// Payment-related constants
export const DEFAULT_UPI_VPA = 'eventia@okicici';
export const DEFAULT_MERCHANT_NAME = 'Eventia Tickets';
export const DEFAULT_DESCRIPTION = 'Official payment account for Eventia ticket purchases';

// Validation constants
export const MIN_NAME_LENGTH = 3;
export const MIN_ADDRESS_LENGTH = 10;
export const PHONE_REGEX = /^\+?[1-9]\d{9,14}$/;
export const UPI_VPA_REGEX = /^[a-zA-Z0-9.\-_]+@[a-zA-Z]+$/;

// UI constants
export const QR_CODE_SAMPLE_AMOUNT = 100;
export const COPY_TIMEOUT = 3000; // 3 seconds
export const REFRESH_TIMEOUT = 1000; // 1 second 