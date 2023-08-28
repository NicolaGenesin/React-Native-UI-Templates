import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MyPressable from '../components/MyPressable';

const SetlistsSearchScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [playlistId, setPlaylistId] = useState<string>('');
  const [setlists, setSetlists] = useState<any[]>([]);

  const apiKey = 'Y9sBv3Zzx7gxuYRlgxWDSXGYPytvfzdW0Fzo';
  const searchQuery = 'Tool';

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
      <View style={{ marginTop: 24 }}>
        <Button title="Search Setlists" onPress={searchSetlists} />
      </View>

      <FlatList
        data={setlists}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <MyPressable
            style={{ marginTop: 8 }}
            onPress={() => {
              console.log(JSON.stringify(item, null, 2));

              navigation.navigate('SetlistDetailScreen', {
                setlist: item,
              });
            }}
          >
            <Text>{item.eventDate}</Text>
            <Text>{item.artist.name}</Text>
          </MyPressable>
        )}
      />
    </>
  );
};

export default SetlistsSearchScreen;
