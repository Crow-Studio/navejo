import { Google, GitHub } from "arctic";

interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

function validateOAuthConfig(provider: string, config: Partial<OAuthConfig>): OAuthConfig {
  const { clientId, clientSecret, redirectUri } = config;

  if (!clientId) {
    throw new Error(`Missing ${provider}_CLIENT_ID environment variable`);
  }
  if (!clientSecret) {
    throw new Error(`Missing ${provider}_CLIENT_SECRET environment variable`);
  }
  if (!redirectUri) {
    throw new Error(`Missing ${provider}_REDIRECT_URI environment variable`);
  }

  return { clientId, clientSecret, redirectUri };
}

const googleConfig = validateOAuthConfig('GOOGLE', {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
});

const githubConfig = validateOAuthConfig('GITHUB', {
  clientId: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  redirectUri: process.env.GITHUB_REDIRECT_URI,
});

export const google = new Google(
  googleConfig.clientId,
  googleConfig.clientSecret,
  googleConfig.redirectUri
);

export const github = new GitHub(
  githubConfig.clientId,
  githubConfig.clientSecret,
  githubConfig.redirectUri
);