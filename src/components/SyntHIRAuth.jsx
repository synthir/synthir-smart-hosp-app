import { PublicClientApplication, InteractionType } from '@azure/msal-browser';
import { MsalProvider, useMsal, useMsalAuthentication } from '@azure/msal-react';

const App = () => {

  const msalConfig = {
    auth: {
      clientId: '87aa6a88-66d2-4970-a283-a04b1cbfcebf',
      authority: 'https://login.microsoftonline.com/3501f7d4-74fc-458f-99c8-4104266fbb46',
      redirectUri: 'http://localhost:3000' // Redirect URI configured in your Azure AD app registration
    },
  };

  const msalInstance = new PublicClientApplication(msalConfig);

  return (
    <MsalProvider instance={msalInstance}>
      <YourComponent />
    </MsalProvider>
  );
};

const YourComponent = () => {
  const { instance } = useMsal();

  // Define a function to handle the login process
  const login = async () => {
    const loginRequest = {
      scopes: ['openid', 'profile', 'User.Read'] // Add the necessary scopes for the access token
    };

    const result = await instance.loginPopup(loginRequest);
    console.log('Access token:', result.accessToken);
  };

  // Use the `useMsalAuthentication` hook to get an access token
  const { error, data } = useMsalAuthentication(InteractionType.Popup, {
    scopes: ['openid', 'profile', 'User.Read'] // Add the necessary scopes for the access token
  });

  if (error) {
    return <div>An error occurred: {error.errorMessage}</div>;
  }

  if (data) {
    console.log('Access token:', data.accessToken);
  }

  return (
    <div>
      <button onClick={login}>Login</button>
    </div>
  );
};

export default App;

