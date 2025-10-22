// global-constellation.d.ts: Ambient declarations for Constellation globals used in tests
// Extend these as needed for better typing.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const PCore: any; // now truly global (no module export in this file)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const PConnect: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare function getPConnect(): any;

interface Window {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  PCore: any;
}
