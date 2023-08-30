import React, { useEffect, useState } from 'react';
import { Image, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MyPressable from '../components/MyPressable';
import { searchArtistSetlistsOnFM } from '../util/network';
import {
  FMSetlist,
  ScreenComponentProps,
  SpotifyArtist,
} from '../design_course/model/types';
import TopNavigation from './TopNavigation';
import SetlistsSearchScreenItem from './SetlistsSearchScreenItem';

const SetlistsSearchScreen: React.FC<ScreenComponentProps> = (
  props: ScreenComponentProps,
) => {
  const navigation = useNavigation<any>();
  const [setlists, setSetlists] = useState<FMSetlist[]>([]);
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
      <TopNavigation title={artist.name.toUpperCase()} />

      <FlatList
        data={setlists}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <Image
            style={{ height: 128, width: '100%' }}
            source={{
              uri:
                artist?.images?.[0]?.url ||
                'https://st3.depositphotos.com/17828278/33150/v/450/depositphotos_331503262-stock-illustration-no-image-vector-symbol-missing.jpg',
            }}
            resizeMode="cover"
          />
        }
        renderItem={({ item, index }) => (
          <MyPressable
            style={{ marginTop: 8 }}
            onPress={() => {
              navigation.navigate('SetlistDetailScreen', {
                setlist: item,
                artist,
              });
            }}
          >
            <SetlistsSearchScreenItem item={item} index={index} />
          </MyPressable>
        )}
      />
    </>
  );
};

export default SetlistsSearchScreen;
