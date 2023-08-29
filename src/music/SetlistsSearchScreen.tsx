import React, { useEffect, useState } from 'react';
import { Text, Image, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MyPressable from '../components/MyPressable';
import { searchArtistSetlistsOnFM } from '../util/network';
import { SpotifyArtist } from '../design_course/model/types';

const SetlistsSearchScreen: React.FC = props => {
  const navigation = useNavigation<any>();
  const [setlists, setSetlists] = useState<any[]>([]);
  const artist: SpotifyArtist = props.route.params.artist;

  useEffect(() => {
    if (artist) {
      searchArtistSetlistsOnFM(artist.name).then(response => {
        setSetlists(response);
      });
    }
  }, [artist]);

  return (
    <>
      <Image
        style={{ height: 128, width: '100%', marginTop: 32 }}
        source={{
          uri:
            artist?.images?.[0]?.url ||
            'https://st3.depositphotos.com/17828278/33150/v/450/depositphotos_331503262-stock-illustration-no-image-vector-symbol-missing.jpg',
        }}
        resizeMode="cover"
      />
      <FlatList
        data={setlists}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <MyPressable
            style={{ marginTop: 8 }}
            onPress={() => {
              navigation.navigate('SetlistDetailScreen', {
                setlist: item,
                artist,
              });
            }}
          >
            <Text>{item.artist.name}</Text>
            <Text>{item.eventDate}</Text>
          </MyPressable>
        )}
      />
    </>
  );
};

export default SetlistsSearchScreen;
