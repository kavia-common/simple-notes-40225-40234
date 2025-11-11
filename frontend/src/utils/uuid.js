function hex(len) {
  let out = '';
  for (let i = 0; i < len; i++) {
    out += ((Math.random() * 16) | 0).toString(16);
  }
  return out;
}

/**
 * PUBLIC_INTERFACE
 * createUUID generates a RFC4122-like ID sufficient for client-side uniqueness.
 */
export function createUUID() {
  return (
    hex(8) + '-' +
    hex(4) + '-4' + hex(3) + '-' +
    ((8 + ((Math.random() * 4) | 0)).toString(16)) + hex(3) + '-' +
    hex(12)
  );
}
