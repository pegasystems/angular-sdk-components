// Point the suite at any deployment: SDK_E2E_BASE_URL=https://my-env.example.com npx playwright test
const origin = (process.env.SDK_E2E_BASE_URL || 'http://localhost:3500').replace(/\/$/, '');

const config = {
  origin,
  baseUrl: `${origin}/portal`,
  baseEmbedUrl: `${origin}/embedded`,
  apps: {
    mediaCo: {
      rep: {
        username: 'rep@mediaco',
        password: 'pega'
      },
      manager: {
        username: 'manager@mediaco',
        password: 'pega'
      },
      tech: {
        username: 'tech@mediaco',
        password: 'pega'
      },
      admin: {
        username: 'admin@mediaco',
        password: 'pega'
      }
    },
    digv2: {
      user: {
        username: 'user.digv2',
        password: 'pega'
      },
      localizedUser: {
        username: 'localization@DigV2',
        password: 'pega'
      }
    }
  },
  testsetting: {
    // Enable network throttling(Default is false)
    throttle: false,
    // Simulate absence of connectivity
    offline: false,
    // Simulated download speed (bytes/s)
    downloadThroughput: 500,
    // Simulated upload speed (bytes/s)
    uploadThroughput: 500,
    // Simulated latency (ms)
    latency: 20,

    defaulttimeout: 60000,
    jesttimeout: 300000,
    slowmo: 120,
    slowmof: 30,
    width: 1920,
    height: 1080,
    headless: true,
    devtools: false
  }
};

exports.config = config;
