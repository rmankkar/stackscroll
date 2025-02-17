import { Auth0Client } from '@auth0/auth0-spa-js';

const auth0 = new Auth0Client({
  domain: 'dev-your-domain.auth0.com',
  clientId: 'your-client-id',
  authorizationParams: {
    redirect_uri: `${window.location.origin}/callback`,
  },
});

export async function login() {
  await auth0.loginWithRedirect();
}

export async function logout() {
  await auth0.logout({
    logoutParams: {
      returnTo: window.location.origin,
    },
  });
}

export async function getUser() {
  const isAuthenticated = await auth0.isAuthenticated();
  if (!isAuthenticated) {
    return null;
  }
  return await auth0.getUser();
}

export async function handleCallback() {
  await auth0.handleRedirectCallback();
}
