import { Injectable } from '@angular/core';
import { getSdkConfig, SdkConfigAccess } from '../_helpers/authMgr';
import { Utils } from '../_helpers/utils';
import { endpoints } from './endpoints';

declare const window: any;

@Injectable({
  providedIn: 'root'
})
export class ServerConfigService {

  constructor() {}

  /**
   * Asynchronous initialization of the config file contents.
   * @returns Promise of config file fetch
   */
  readSdkConfig(): Promise<any> {
    return getSdkConfig();
  }


  /**
   *
   * @returns the sdk-config JSON object
   */
  async getSdkConfig(): Promise<any> {
    return SdkConfigAccess.getSdkConfig();
  }

  /**
   *
   * @returns the authConfig block in the SDK Config object
   */
  async getSdkConfigAuth(): Promise<any> {
    return SdkConfigAccess.getSdkConfigAuth();
  }

  /**
   *
   * @returns the serverConfig bloc from the sdk-config.json file
   */
  getSdkConfigServer(): any {
    return SdkConfigAccess.getSdkConfigServer();
  }

  /**
   * @param {String} key the key to be inserted/updated in serverConfig
   * @param {String} value the value to be assigned to the given key
   */
  setSdkConfigServer(key: string, value: string) {
    SdkConfigAccess.setSdkConfigServer(key, value);
  }

  getBaseUrl(): string {
    return SdkConfigAccess.getSdkConfigServer().infinityRestServerUrl;
  }
}
