import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  StatusBar,
  Platform,
  Animated,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import MyPressable from '../components/MyPressable';
import {
  FMSetlist,
  FMSongEntity,
  ScreenComponentProps,
  SpotifyArtist,
} from '../design_course/model/types';
import { savePlaylistOnSpotify, searchSongsOnSpotify } from '../util/network';
import TopNavigation from './TopNavigation';
import { handleLogin } from '../util/auth';
import SetlistDetailScreenItem from './SetlistDetailScreenItem';
import SetlistDetailScreenHeader from './SetlistDetailScreenHeader';

const SetlistDetailScreen: React.FC<ScreenComponentProps> = (
  props: ScreenComponentProps,
) => {
  const screenOpacity = useRef<Animated.Value>(new Animated.Value(0));
  const setlist: FMSetlist = props.route.params.setlist;
  const artist: SpotifyArtist = props.route.params.artist;
  const [allSongs, setAllSongs] = useState<FMSongEntity[]>([]);

  useEffect(() => {
    if (setlist) {
      (async () => {
        const songsFromSet: FMSongEntity[] = [];

        (setlist.sets.set || []).forEach(section => {
          if (section.song) {
            section.song.forEach(song => {
              if (song.name) {
                songsFromSet.push({
                  name: song.name,
                  encore: !!section.encore,
                });
              }
            });
          }
        });

        const songNames = songsFromSet.map(song => song.name);
        const enrichedSpotifyData = await searchSongsOnSpotify(
          songNames,
          setlist.artist.name,
        );

        // Enrich songsFromSet with spotify data by matching song name
        const enrichedSongsFromSet = songsFromSet.map(song => {
          const matchingSong = enrichedSpotifyData.find(
            (s: { songName: string }) => s.songName === song.name,
          );

          if (matchingSong) {
            return {
              ...song,
              spotifyData: matchingSong,
            };
          } else {
            return song;
          }
        });

        setAllSongs(enrichedSongsFromSet);
      })();
    }
  }, [setlist]);

  useEffect(() => {
    Animated.timing(screenOpacity.current, {
      toValue: 1,
      duration: 500,
      delay: 200,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar backgroundColor="transparent" barStyle="dark-content" />
      <View style={[styles.contentContainer]}>
        <TopNavigation title={setlist.artist.name.toUpperCase()} />
        <Animated.View
          style={[styles.listContainer, { opacity: screenOpacity.current }]}
          renderToHardwareTextureAndroid
        >
          <FlatList
            data={allSongs}
            keyExtractor={item => item.name}
            ListHeaderComponent={
              <SetlistDetailScreenHeader
                artist={artist}
                setlist={setlist}
                allSongs={allSongs}
              />
            }
            ListFooterComponent={
              !allSongs.length ? (
                <View style={styles.loadingIndicatorFlatlist}>
                  <ActivityIndicator size="large" color="#85E6C5" />
                </View>
              ) : (
                <View style={{ height: 80 }} />
              )
            }
            renderItem={({ item, index }) => (
              <SetlistDetailScreenItem item={item} index={index} />
            )}
          />
        </Animated.View>
        <Animated.View
          style={[styles.footerContainer]}
          renderToHardwareTextureAndroid
        >
          <View style={styles.saveSetlistButton}>
            <MyPressable
              onPress={async () => {
                await handleLogin();

                const spotifySongIds = allSongs
                  .map(song => song.spotifyData?.id)
                  .filter(id => !!id);

                await savePlaylistOnSpotify(
                  spotifySongIds,
                  `${artist.name} at ${setlist.venue.name}, ${setlist.eventDate}`,
                  artist.images?.[0]?.url,
                  artist.name,
                  setlist.venue.name,
                  setlist.eventDate,
                );
              }}
            >
              <Text style={styles.saveSetlistText}>SAVE SETLIST</Text>
            </MyPressable>
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: 'grey',
    shadowOffset: { width: 1.1, height: 1.1 },
    shadowOpacity: 0.2,
    shadowRadius: 10.0,
    elevation: 16,
  },
  listContainer: { flex: 1 },
  footerContainer: {
    position: 'absolute',
    bottom: 16,
    flexDirection: 'row',
    paddingHorizontal: 24,
  },
  saveSetlistButton: {
    flex: 1,
    borderRadius: 4,
    backgroundColor: '#614BC3',
    elevation: 4,
    ...Platform.select({ android: { overflow: 'hidden' } }),
  },
  saveSetlistText: {
    padding: 18,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: 'bold',
    alignSelf: 'center',
    color: 'white',
  },
  loadingIndicatorFlatlist: {
    flex: 1,
    marginTop: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SetlistDetailScreen;
