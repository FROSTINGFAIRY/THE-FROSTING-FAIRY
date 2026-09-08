import { CustomerProfile } from '../types';

const TOKEN_KEY = 'tff_customer_token';
const CUSTOMER_KEY = 'tff_customer_profile';

export function getStoredCustomerToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (e) {
    return null;
  }
}

export function getStoredCustomer(): CustomerProfile | null {
  try {
    const raw = localStorage.getItem(CUSTOMER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function storeCustomerSession(token: string, customer: CustomerProfile): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer));
  } catch (e) {
    console.warn('Unable to persist customer session to localStorage', e);
  }
}

export function clearCustomerSession(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CUSTOMER_KEY);
  } catch (e) {
    console.warn('Unable to clear customer session from localStorage', e);
  }
}

export async function requestOtp(phoneNumber: string, countryCode: string = '+966'): Promise<{
  success: boolean;
  message?: string;
  fullPhoneNumber: string;
  expiresInSeconds?: number;
  error?: string;
}> {
  const response = await fetch('/api/auth/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber, countryCode }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to send verification OTP.');
  }
  return data;
}

export async function verifyOtpCode(
  fullPhoneNumber: string,
  otp: string
): Promise<{
  success: boolean;
  token: string;
  customer: CustomerProfile;
  isNewCustomer?: boolean;
}> {
  const response = await fetch('/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullPhoneNumber, otp }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Verification failed. Please check the code.');
  }

  storeCustomerSession(data.token, data.customer);
  return data;
}

export async function fetchCurrentSession(token: string): Promise<CustomerProfile | null> {
  try {
    const response = await fetch('/api/auth/session', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      clearCustomerSession();
      return null;
    }
    const data = await response.json();
    if (data.customer) {
      storeCustomerSession(token, data.customer);
      return data.customer;
    }
    return null;
  } catch (e) {
    return null;
  }
}

export async function updateCustomerProfileOnServer(
  token: string,
  profile: Partial<CustomerProfile>
): Promise<CustomerProfile> {
  const response = await fetch('/api/auth/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profile),
  });

  const data = await response.json();
  if (!response.ok || !data.customer) {
    throw new Error(data.error || 'Failed to update profile.');
  }

  storeCustomerSession(token, data.customer);
  return data.customer;
}
