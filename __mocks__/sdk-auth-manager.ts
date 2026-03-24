// Mock for @pega/auth/lib/sdk-auth-manager
const mockSdkConfig = {
  serverConfig: {
    infinityRestServerUrl: 'https://mock-server.example.com',
    appAlias: 'MockApp'
  },
  authConfig: {
    authService: 'mock',
    mashupClientId: 'mock-client-id',
    mashupRedirectUri: 'http://localhost:4200'
  }
};

export const getSdkConfig = () => Promise.resolve(mockSdkConfig);

export const SdkConfigAccess = {
  getSdkConfig: () => Promise.resolve(mockSdkConfig),
  getSdkConfigAuth: () => Promise.resolve(mockSdkConfig.authConfig),
  getSdkConfigServer: () => mockSdkConfig.serverConfig,
  setSdkConfigServer: () => {}
};

export default {
  getSdkConfig,
  SdkConfigAccess
};
