import type PCoreInstance from '@pega/pcore-pconnect-typedefs';
import type { C11nEnv } from '@pega/pcore-pconnect-typedefs/interpreter/c11n-env';

declare global {
  var PCore: PCoreInstance;
  var PConnect: C11nEnv;
  function getPConnect(): C11nEnv;
}

export {};
