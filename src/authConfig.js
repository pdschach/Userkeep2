export const msalConfig = {
  auth: {
    clientId: 'f8e241cf-199b-4de5-ba62-fc3337642dca', // Zorg ervoor dat dit overeenkomt met je app-registratie
    authority: 'https://login.microsoftonline.com/82022306-deb0-41be-94c4-763bf46d3547', // Zorg ervoor dat dit je tenant-ID is
    redirectUri: 'http://localhost:3000', // Zorg ervoor dat deze URI is geregistreerd in de Azure Portal
  },
  cache: {
    cacheLocation: 'localStorage', // Zorg ervoor dat je de juiste opslaglocatie gebruikt
    storeAuthStateInCookie: false, // Zet dit op true als je problemen hebt met cookies in bepaalde browsers
  },
};

export const loginRequest = {
  scopes: [
    'User.Read',
    'User.Read.All',
    'openid',
    'profile',
    'offline_access',
    'Mail.Read',
    'MailboxSettings.Read',
    'Mail.ReadWrite',
    'Mail.ReadWrite.Shared',
  ],
};
