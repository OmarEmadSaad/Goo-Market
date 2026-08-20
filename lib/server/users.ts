import "server-only";

import { cache } from "react";
import { dbReadFresh, dbSet, dbUpdate } from "./db";
import type { PublicUser, UserRecord, UserRole } from "../types";

export const DEFAULT_AVATAR =
  "https://res.cloudinary.com/demo/image/upload/sample.jpg";

export interface UserEntry {
  key: string;
  record: UserRecord;
}

function isRecord(value: unknown): value is UserRecord {
  return typeof value === "object" && value !== null;
}

async function readAllUsers(): Promise<Record<string, unknown>> {
  const data = await dbReadFresh<Record<string, unknown>>("users");
  return isRecord(data) ? data : {};
}

export async function listUserEntries(): Promise<UserEntry[]> {
  const data = await readAllUsers();
  return Object.entries(data)
    .filter((entry): entry is [string, UserRecord] => isRecord(entry[1]))
    .map(([key, record]) => ({ key, record }));
}

export async function findUserEntryById(
  userId: string
): Promise<UserEntry | null> {
  const target = String(userId ?? "");
  if (!target) return null;
  const entries = await listUserEntries();
  return entries.find((entry) => String(entry.record.id) === target) ?? null;
}

export async function findUserEntryByEmail(
  email: string
): Promise<UserEntry | null> {
  const target = String(email ?? "").trim().toLowerCase();
  if (!target) return null;
  const entries = await listUserEntries();
  return (
    entries.find(
      (entry) => getEmail(entry.record).toLowerCase() === target
    ) ?? null
  );
}

export function getEmail(record: UserRecord | null | undefined): string {
  return String(record?.Email ?? record?.email ?? "").trim();
}

export function getDisplayName(record: UserRecord | null | undefined): string {
  return String(record?.userName ?? record?.name ?? record?.username ?? "").trim();
}

export function getRole(record: UserRecord | null | undefined): UserRole {
  return record?.role === "admin" ? "admin" : "user";
}

export function toPublicUser(record: UserRecord): PublicUser {
  return {
    id: String(record?.id ?? ""),
    name: getDisplayName(record) || "Shopper",
    email: getEmail(record),
    role: getRole(record),
    image:
      typeof record?.image === "string" && record.image
        ? record.image
        : DEFAULT_AVATAR,
    gender: String(record?.gender ?? ""),
  };
}

export const getUserById = cache(
  async (userId: string): Promise<UserRecord | null> => {
    const entry = await findUserEntryById(userId);
    return entry ? entry.record : null;
  }
);

export async function updateUserRecord(
  key: string,
  patch: Partial<UserRecord>
): Promise<unknown> {
  return dbUpdate(`users/${key}`, patch);
}

export async function replaceUserRecord(
  key: string,
  record: UserRecord
): Promise<unknown> {
  return dbSet(`users/${key}`, record);
}

export async function createUserRecord(record: UserRecord): Promise<string> {
  const key = `u_${record.id}`;
  await dbSet(`users/${key}`, record);
  return key;
}
