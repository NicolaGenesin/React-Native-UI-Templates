import { authorize, refresh, revoke } from 'react-native-app-auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const config = {
  clientId: 'b026c2aa14e34e3f92aed1b4de111ca2',
  redirectUrl: 'setlistify:/oauth',
  scopes: ['playlist-modify-public', 'playlist-modify-private'],
  serviceConfiguration: {
    authorizationEndpoint: 'https://accounts.spotify.com/authorize',
    tokenEndpoint: 'https://accounts.spotify.com/api/token',
    // revocationEndpoint: 'REVOCATION_ENDPOINT_URL',
  },
};

const storeTokens = async (
  accessToken: string,
  refreshToken: string,
  expirationDate: string,
) => {
  try {
    await AsyncStorage.setItem('accessToken', accessToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);
    await AsyncStorage.setItem('accessTokenExpirationDate', expirationDate);
  } catch (error) {
    console.error('Error storing tokens:', error);
  }
};

export const retrieveTokens = async () => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    const accessTokenExpirationDate = await AsyncStorage.getItem(
      'accessTokenExpirationDate',
    );
    return { accessToken, refreshToken, accessTokenExpirationDate };
  } catch (error) {
    console.error('Error retrieving tokens:', error);
    return {
      accessToken: null,
      refreshToken: null,
      accessTokenExpirationDate: null,
    };
  }
};

export const handleLogin = async () => {
  try {
    const { accessToken, refreshToken, accessTokenExpirationDate } =
      await retrieveTokens();

    if (accessToken && refreshToken && accessTokenExpirationDate) {
      const expirationDate = new Date(accessTokenExpirationDate);
      const currentTime = new Date();

      if (expirationDate <= currentTime) {
        // Access token is expired, refresh it
        const result = await refresh(config, { refreshToken });

        await storeTokens(
          result.accessToken,
          result.refreshToken as string,
          result.accessTokenExpirationDate,
        );
        // Use the new access token for API requests
      } else {
        // Access token is still valid, use it for API requests
      }
    } else {
      // Perform the initial login flow
      const result = await authorize(config);
      const { accessToken, refreshToken, accessTokenExpirationDate } = result;

      // Example Result
      //   {
      //     "accessToken": "xxxx",
      //     "accessTokenExpirationDate": "2023-08-28T10:38:38Z",
      //     "authorizeAdditionalParameters": {},
      //     "idToken": "",
      //     "refreshToken": "yyyy",
      //     "scopes": [],
      //     "tokenAdditionalParameters": {},
      //     "tokenType": "Bearer"
      //   }

      await storeTokens(accessToken, refreshToken, accessTokenExpirationDate);
      // Use the access token for API requests
    }
  } catch (error) {
    // Handle authentication errors
    console.error('Authentication error:', error);
  }
};

export const handleLogout = async () => {
  try {
    const { accessToken } = await retrieveTokens();

    if (accessToken) {
      await revoke(config, { tokenToRevoke: accessToken, sendClientId: true });
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      // Clear the stored tokens and perform any other necessary cleanup
    }
  } catch (error) {
    // Handle logout errors
    console.error('Logout error:', error);
  }
};
