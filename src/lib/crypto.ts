const ITERATIONS = 80_000;
const KEY_LEN = 256;
const C = globalThis.crypto as any;

function buf2b64(buf: Uint8Array): string {
  let s = '';
  for (let i = 0; i < buf.length; i++) s += String.fromCharCode(buf[i]);
  return btoa(s);
}

function b642buf(b64: string): Uint8Array {
  const s = atob(b64);
  const buf = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) buf[i] = s.charCodeAt(i);
  return buf;
}

function toBuf(v: Uint8Array): ArrayBuffer { return v.buffer.slice(v.byteOffset, v.byteOffset + v.byteLength) as ArrayBuffer; }

export async function hashPassword(pw: string): Promise<{ hash: string; salt: string }> {
  const salt = new Uint8Array(16);
  if (C?.getRandomValues) C.getRandomValues(salt);
  else for (let i = 0; i < 16; i++) salt[i] = Math.floor(Math.random() * 256);
  if (!C?.subtle) {
    let r = new Uint8Array(new TextEncoder().encode(pw).length + 16);
    r.set(new TextEncoder().encode(pw)); r.set(salt, new TextEncoder().encode(pw).length);
    for (let i = 0; i < ITERATIONS / 1000; i++) {
      const mix = new Uint8Array(32);
      for (let j = 0; j < 32; j++) mix[j] = (r[j % r.length] + r[(j * 7 + i) % r.length] + i) & 255;
      r = mix;
    }
    return { hash: buf2b64(r), salt: buf2b64(salt) };
  }
  const key = await C.subtle.importKey('raw', toBuf(new TextEncoder().encode(pw)), 'PBKDF2', false, ['deriveBits']);
  const bits = await C.subtle.deriveBits({ name: 'PBKDF2', salt: toBuf(salt), iterations: ITERATIONS, hash: 'SHA-256' }, key, KEY_LEN);
  return { hash: buf2b64(new Uint8Array(bits)), salt: buf2b64(salt) };
}

export async function verifyPassword(pw: string, hash: string, saltB64: string): Promise<boolean> {
  const salt = b642buf(saltB64);
  if (!C?.subtle) {
    let r = new Uint8Array(new TextEncoder().encode(pw).length + salt.length);
    r.set(new TextEncoder().encode(pw)); r.set(salt, new TextEncoder().encode(pw).length);
    for (let i = 0; i < ITERATIONS / 1000; i++) {
      const mix = new Uint8Array(32);
      for (let j = 0; j < 32; j++) mix[j] = (r[j % r.length] + r[(j * 7 + i) % r.length] + i) & 255;
      r = mix;
    }
    return buf2b64(r) === hash;
  }
  const key = await C.subtle.importKey('raw', toBuf(new TextEncoder().encode(pw)), 'PBKDF2', false, ['deriveBits']);
  const bits = await C.subtle.deriveBits({ name: 'PBKDF2', salt: toBuf(salt), iterations: ITERATIONS, hash: 'SHA-256' }, key, KEY_LEN);
  return buf2b64(new Uint8Array(bits)) === hash;
}
