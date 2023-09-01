import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
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

  const fetchSetlists = (page: number) => {
    if (artist) {
      searchArtistSetlistsOnFM(artist.name, page).then((response: any) => {
        setSetlists(prevSetlists => [...prevSetlists, ...response.setlist]);
        setScreenState({
          itemsPerPage: response.itemsPerPage,
          page: response.page,
          total: response.total,
        });
      });
    }
  };

  useEffect(() => {
    fetchSetlists(1);
  }, [artist]);

  useEffect(() => {
    if (setlists.length < 10) {
      fetchSetlists(screenState.page + 1);
    }
  }, [setlists]);

  return (
    <View style={styles.container}>
      <TopNavigation title={artist.name.toUpperCase()} />
      <FlatList
        data={setlists}
        keyExtractor={(item, index) => `${item.id}-${index}`}
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
        ListFooterComponent={
          !setlists.length ? (
            <View style={styles.loadingIndicatorFlatlist}>
              <ActivityIndicator size="large" color="#85E6C5" />
            </View>
          ) : null
        }
        onEndReached={() => fetchSetlists(screenState.page + 1)}
        onEndReachedThreshold={0.1}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: 'white', flex: 1 },
  loadingIndicatorFlatlist: {
    flex: 1,
    marginTop: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SetlistsSearchScreen;
