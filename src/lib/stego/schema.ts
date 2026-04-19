export const MAGIC_HEADER = "ENIG";
export const SCHEMA_VERSION = 1;
export const ENCODING_MODE_LSB = "lsb";

export type PayloadEnvelope = {
  magic: string;
  version: number;
  mode: string;
  text: string;
  createdAt: string;
  checksum: number;
};

export function buildEnvelope(text: string): PayloadEnvelope {
  return {
    magic: MAGIC_HEADER,
    version: SCHEMA_VERSION,
    mode: ENCODING_MODE_LSB,
    text,
    createdAt: new Date().toISOString(),
    checksum: checksum32(text),
  };
}

export function checksum32(input: string): number {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }
  return hash;
}
