import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, Linking } from 'react-native';
import { authorize } from 'react-native-app-auth';
import { useNavigation } from '@react-navigation/native';

const SpotifyPlaylist: React.FC = () => {
  const navigation = useNavigation<any>();
  const [accessToken, setAccessToken] = useState<string>('');
  const [playlistId, setPlaylistId] = useState<string>('');
  const [setlists, setSetlists] = useState<any[]>([]);

  console.log('accesstok', accessToken);

  const config = {
    clientId: 'b026c2aa14e34e3f92aed1b4de111ca2',
    clientSecret: '296cd1ea8bae48e28198bff673cf5f5c',
    redirectUrl: 'setlistify:/oauth',
    scopes: ['playlist-modify-public', 'playlist-modify-private'],
    serviceConfiguration: {
      authorizationEndpoint: 'https://accounts.spotify.com/authorize',
      tokenEndpoint: 'https://accounts.spotify.com/api/token',
    },
  };

  const apiKey = 'Y9sBv3Zzx7gxuYRlgxWDSXGYPytvfzdW0Fzo';
  const searchQuery = 'Placebo';

  useEffect(() => {
    console.log('a');
    const handleUrl = async url => {
      console.log('b');
      // Check if the URL matches your custom URL scheme
      if (url.startsWith('setlistify://oauthredirect')) {
        console.log('c');
        // Parse the URL to extract any relevant information (e.g., tokens)
        // Handle the data as needed (e.g., complete the authentication process)
      }
    };

    // Add a listener for URL changes
    const subscription = Linking.addEventListener('url', event => {
      handleUrl(event.url);
    });

    // Clean up the listener when the component unmounts
    return () => {
      subscription.remove();
    };
  }, []);

  const authorizeSpotify = async () => {
    try {
      const result = await authorize(config);

      console.log(result);

      setAccessToken(result.accessToken);
    } catch (error) {
      console.error('Spotify Authorization Error', error);
    }
  };

  const searchSetlists = async () => {
    try {
      const response = await fetch(
        `https://api.setlist.fm/rest/1.0/search/setlists?artistName=${encodeURIComponent(
          searchQuery,
        )}`,
        {
          headers: {
            'x-api-key': apiKey,
            Accept: 'application/json',
          },
        },
      );

      console.log(response);

      if (response.ok) {
        const data = await response.json();
        const setlists = data.setlist || [];
        setSetlists(setlists);
      } else {
        console.error('Error searching for setlists');
      }
    } catch (error) {
      console.error('Error searching for setlists', error);
    }
  };

  const openPlaylist = async (selectedSetlist: any) => {
    try {
      // const response = await fetch('https://api.spotify.com/v1/me/playlists', {
      //   method: 'POST',
      //   headers: {
      //     Authorization: `Bearer ${accessToken}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     name: `Setlist from ${selectedSetlist.artist.name}`,
      //     public: false,
      //   }),
      // });

      // if (response.ok) {
      // const data = await response.json();
      // setPlaylistId(data.id);

      // console.log(selectedSetlist.sets.set[0]);

      console.log(selectedSetlist);

      for (const song of selectedSetlist.sets.set[0].song) {
        // console.log(song);

        const query = `${song.name} ${selectedSetlist.artist.name}`;
        const searchResponse = await fetch(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(
            query,
          )}&type=track`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        if (searchResponse.ok) {
          const searchResult = await searchResponse.json();
          const trackId = searchResult.tracks.items[0]?.id;
          const trackImageUrl =
            searchResult.tracks.items[0]?.album?.images?.[1].url;

          console.log(query, trackId, trackImageUrl);
          // if (trackId) {
          //   addTrackToPlaylist(trackId);
          // } else {
          //   console.warn(`No track found for ${song.name}`);
          // }
        } else {
          console.error('Error searching for track', searchResponse);
        }
      }

      console.log('Setlist added to playlist');
      // } else {
      //   console.error('Error creating playlist 1');
      // }
    } catch (error) {
      console.error('Error creating playlist 2', error);
    }
  };

  const addTrackToPlaylist = async (trackId: string) => {
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uris: [`spotify:track:${trackId}`],
          }),
        },
      );

      if (response.ok) {
        console.log('Track added to playlist');
      } else {
        console.error('Error adding track to playlist');
      }
    } catch (error) {
      console.error('Error adding track to playlist', error);
    }
  };

  return (
    <>
      <Button title="Authorize Spotify" onPress={authorizeSpotify} />
      <Button title="Search Setlists" onPress={searchSetlists} />

      <FlatList
        data={setlists}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View>
            <Text>{item.eventDate}</Text>
            <Text>{item.artist.name}</Text>
            <Button
              title="Open Playlist"
              onPress={() => {
                navigation.navigate('CourseInfo', {
                  setlist: item,
                  accessToken: accessToken,
                });

                // openPlaylist(item);
              }}
            />
          </View>
        )}
      />
    </>
  );
};

export default SpotifyPlaylist;
