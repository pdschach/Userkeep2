export const msalConfig = {
  auth: {
    clientId: 'f8e241cf-199b-4de5-ba62-fc3337642dca',
    authority: 'https://login.microsoftonline.com/82022306-deb0-41be-94c4-763bf46d3547',
    redirectUri: 'http://localhost:3000',
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ['User.Read', 'User.Read.All', 'openid', 'profile', 'offline_access'],
};
