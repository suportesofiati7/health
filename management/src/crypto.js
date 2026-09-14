const encode = (bytes) => {
  let s = "";
  for (let i = 0; i < bytes.length; i += 8192)
    s += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(s);
};
const decode = (value) => Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
async function keyFor(passphrase, salt, usage) {
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 600000, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    usage,
  );
}
export async function encrypt(data, passphrase) {
  if (passphrase.length < 16) throw Error("passphrase");
  const salt = crypto.getRandomValues(new Uint8Array(16)),
    iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await keyFor(passphrase, salt, ["encrypt"]);
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      new TextEncoder().encode(JSON.stringify(data)),
    ),
  );
  return {
    format: "sofiati-encrypted-v1",
    algorithm: "AES-GCM",
    iterations: 600000,
    salt: encode(salt),
    iv: encode(iv),
    ciphertext: encode(ciphertext),
  };
}
export async function decrypt(packet, passphrase) {
  if (
    packet.format !== "sofiati-encrypted-v1" ||
    packet.algorithm !== "AES-GCM" ||
    packet.iterations !== 600000
  )
    throw Error("format");
  const key = await keyFor(passphrase, decode(packet.salt), ["decrypt"]);
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: decode(packet.iv) },
    key,
    decode(packet.ciphertext),
  );
  return JSON.parse(new TextDecoder().decode(plain));
}
export const fileBase64 = async (blob) =>
  encode(new Uint8Array(await blob.arrayBuffer()));
async function digest(bytes) {
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(b=>b.toString(16).padStart(2,'0')).join('');
}
export async function encryptPackets(data, passphrase, chunkSize = 3000000) {
  const bytes = new TextEncoder().encode(JSON.stringify(data));
  if (bytes.length <= chunkSize) return [await encrypt(data, passphrase)];
  const set = crypto.randomUUID(), hash = await digest(bytes), total = Math.ceil(bytes.length / chunkSize), packets = [];
  for (let index = 0; index < total; index++) {
    packets.push(await encrypt({ format:'sofiati-part-v1', set, index, total, sha256:hash,
      chunk:encode(bytes.subarray(index*chunkSize, (index+1)*chunkSize)) }, passphrase));
  }
  return packets;
}
export async function decryptPackets(packets, passphrase) {
  if (!packets.length) throw Error('missing_parts');
  const parts = [];
  for (const packet of packets) parts.push(await decrypt(packet,passphrase));
  if (parts.length === 1 && parts[0].format !== 'sofiati-part-v1') return parts[0];
  const first = parts[0];
  if (parts.length !== first.total || parts.some(p=>p.format!=='sofiati-part-v1' || p.set!==first.set || p.total!==first.total || p.sha256!==first.sha256)) throw Error('missing_parts');
  parts.sort((a,b)=>a.index-b.index);
  if (parts.some((p,i)=>p.index!==i)) throw Error('duplicate_parts');
  const chunks = parts.map(p=>decode(p.chunk)), bytes = new Uint8Array(chunks.reduce((sum,b)=>sum+b.length,0));
  let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  if (await digest(bytes)!==first.sha256) throw Error('integrity');
  return JSON.parse(new TextDecoder().decode(bytes));
}
export function download(blob, name) {
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
