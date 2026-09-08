import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

// `promisify` picks the 3-arg overload; the options object needs the 4-arg one.
const scrypt = promisify(scryptCb) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: { N: number, r: number, p: number, maxmem: number },
) => Promise<Buffer>

/**
 * Password hashing with Node's built-in scrypt.
 *
 * scrypt is memory-hard and part of the standard library, so it gives solid
 * protection without adding a native bcrypt/argon2 dependency.
 *
 * Format: `scrypt$N$r$p$saltHex$keyHex`. Parameters are stored alongside the
 * hash so they can be raised later without invalidating existing passwords.
 */

const N = 16384
const r = 8
const p = 1
const KEYLEN = 64

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const key = await scrypt(password, salt, KEYLEN, { N, r, p, maxmem: 64 * 1024 * 1024 })
  return `scrypt$${N}$${r}$${p}$${salt.toString('hex')}$${key.toString('hex')}`
}

/** Constant-time verification. Returns false on any malformed stored hash. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const parts = stored.split('$')
    if (parts.length !== 6 || parts[0] !== 'scrypt') return false

    const [, nRaw, rRaw, pRaw, saltHex, keyHex] = parts
    const salt = Buffer.from(saltHex!, 'hex')
    const expected = Buffer.from(keyHex!, 'hex')

    const derived = await scrypt(password, salt, expected.length, {
      N: Number(nRaw),
      r: Number(rRaw),
      p: Number(pRaw),
      maxmem: 64 * 1024 * 1024,
    })

    return derived.length === expected.length && timingSafeEqual(derived, expected)
  }
  catch {
    return false
  }
}
