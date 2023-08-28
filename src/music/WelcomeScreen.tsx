import React, { useEffect } from 'react';
import { View, Button } from 'react-native';
import { handleLogin, handleLogout, retrieveTokens } from '../util/auth';

const WelcomeScreen: React.FC = () => {
  useEffect(() => {
    // Perform any necessary initialization or checks
  }, []);

  return (
    <View>
      <Button title="Login" onPress={handleLogin} />
      <Button title="Logout" onPress={handleLogout} />
      <Button
        title="gt tokens"
        onPress={async () => {
          let p1 = await retrieveTokens();

          console.log(p1.accessTokenExpirationDate);

          await handleLogin();

          let p2 = await retrieveTokens();

          console.log(p2.accessTokenExpirationDate);

          // prima di qualsiasi richesta a spotify
          // await handleLogin();
          // const {accessToken} = await retrieveTokens();
          // fetch
        }}
      />
    </View>
  );
};

export default WelcomeScreen;
