// graph.js
import { Client } from '@microsoft/microsoft-graph-client';

// Functie om gebruikers op te halen
export async function getUsers(accessToken) {
  const client = Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    },
  });

  try {
    let users = [];
    let result = await client
      .api('/users')
      .filter(`userType eq 'Member'`) // Filter om alleen members op te halen
      .select('id,displayName,givenName,surname,userPrincipalName,jobTitle,department,createdDateTime')
      .top(100) // Haal 100 gebruikers per keer op
      .get();

    users = users.concat(result.value);

    // Check for pagination
    while (result["@odata.nextLink"]) {
      result = await client.api(result["@odata.nextLink"]).get();
      users = users.concat(result.value);
    }

    // Sorteer de gebruikers op createdDateTime in aflopende volgorde (nieuwste eerst)
    const sortedUsers = users.sort((a, b) => new Date(b.createdDateTime) - new Date(a.createdDateTime));

    // Retourneer de laatste 30 gebruikers
    return sortedUsers.slice(0, 30);
  } catch (error) {
    console.error("Error fetching users from Graph API:", error);
    throw error;
  }
}

// Functie om de groepen van een gebruiker op te halen
export async function getUserGroups(userId, accessToken) {
  const client = Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    },
  });

  try {
    const result = await client
      .api(`/users/${userId}/memberOf`)
      .select('displayName')
      .get();

    return result.value.map(group => group.displayName);
  } catch (error) {
    console.error("Error fetching user groups from Graph API:", error);
    throw error;
  }
}

// Functie om de mailboxen van een gebruiker op te halen
export async function getUserMailboxes(userId, accessToken) {
  const client = Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    },
  });

  try {
    const result = await client
      .api(`/users/${userId}/mailFolders`)
      .select('id,displayName')
      .get();

    return result.value.map(mailbox => ({
      id: mailbox.id,
      displayName: mailbox.displayName,
    }));
  } catch (error) {
    console.error('Error fetching mail folders from Graph API:', error);
    throw error;
  }
}
