import { nanoid } from "nanoid";

export function generateUserId(): string {
  return `usr_${nanoid(16)}`;
}

export function generateSourceId(): string {
  return `src_${nanoid(16)}`;
}

export function generateConnectionId(): string {
  return `conn_${nanoid(16)}`;
}

export function generateEventId(): string {
  return `evt_${nanoid(16)}`;
}

export function generateApiKeyId(): string {
  return `key_${nanoid(16)}`;
}

export function generateRequestId(): string {
  return `req_${nanoid(16)}`;
}

export function generateRefreshTokenId(): string {
  return `rtk_${nanoid(16)}`;
}
