import { config, findClient, findPod } from '@/config/pods';
import type { PodConfig, ClientConfig } from '@/config/pods';

export type AuthResult =
  | { valid: false }
  | { valid: true; level: 'ceo' }
  | { valid: true; level: 'pod'; pod: PodConfig }
  | { valid: true; level: 'client'; pod: PodConfig; client: ClientConfig };

export function validateClientToken(
  slug: string,
  token: string | null
): AuthResult {
  if (!token) return { valid: false };
  const match = findClient(slug);
  if (!match || match.client.token !== token) return { valid: false };
  return { valid: true, level: 'client', pod: match.pod, client: match.client };
}

export function validatePodToken(
  slug: string,
  token: string | null
): AuthResult {
  if (!token) return { valid: false };
  const pod = findPod(slug);
  if (!pod || pod.token !== token) return { valid: false };
  return { valid: true, level: 'pod', pod };
}

export function validateCeoToken(token: string | null): AuthResult {
  if (!token) return { valid: false };
  if (token !== config.ceoToken) return { valid: false };
  return { valid: true, level: 'ceo' };
}
