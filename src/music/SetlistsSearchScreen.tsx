import React, { useEffect, useState } from 'react';
import { FlatList } from 'react-native';
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
  const [screenState, setScreenState] = useState<{
    itemsPerPage: number;
    page: number;
    total: number;
  }>({
    itemsPerPage: 0,
    page: 0,
    total: 0,
  });
  const artist: SpotifyArtist = props.route.params.artist;

  useEffect(() => {
    if (artist) {
      searchArtistSetlistsOnFM(artist.name).then((response: any) => {
        setSetlists(response.setlist);
        setScreenState({
          itemsPerPage: response.itemsPerPage,
          page: response.page,
          total: response.total,
        });
      });
    }
  }, [artist]);

  return (
    <>
      <TopNavigation title={artist.name.toUpperCase()} />
      <FlatList
        data={setlists}
        keyExtractor={item => item.id}
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
