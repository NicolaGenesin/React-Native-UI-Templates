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
  Alert,
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
import moment from 'moment';

const loginAndSavePlaylist = async (
  allSongs: FMSongEntity[],
  setlist: FMSetlist,
  artist: SpotifyArtist,
  playlistName: string,
) => {
  await handleLogin();

  const spotifySongIds = allSongs
    .map(song => song.spotifyData?.id)
    .filter(id => !!id);

  const date = moment(setlist.eventDate, 'DD-MM-YYYY').format('MMM DD, YYYY');

  const isSaved = await savePlaylistOnSpotify(
    spotifySongIds,
    playlistName || `${artist.name} at ${setlist.venue.name}, ${date}`,
    artist.images?.[0]?.url,
    artist.name,
    setlist.venue.name,
    date,
  );

  if (isSaved) {
    Alert.alert(
      'Playlist Created 🙌',
      'Check your Spotify app to listen to the playlist!',
      [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
    );
  } else {
    Alert.alert('An error occurred 🤕', 'Please try again later!', [
      { text: 'OK', onPress: () => console.log('OK Pressed') },
    ]);
  }

  return isSaved;
};

const SetlistDetailScreen: React.FC<ScreenComponentProps> = (
  props: ScreenComponentProps,
) => {
  const screenOpacity = useRef<Animated.Value>(new Animated.Value(0));
  const setlist: FMSetlist = props.route.params.setlist;
  const artist: SpotifyArtist = props.route.params.artist;
  const [allSongs, setAllSongs] = useState<FMSongEntity[]>([]);
  const [playlistName, setPlaylistName] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    if (artist && setlist) {
      const date = moment(setlist.eventDate, 'DD-MM-YYYY').format(
        'MMM DD, YYYY',
      );

      setPlaylistName(`${artist.name} at ${setlist.venue.name}, ${date}`);
    }
  }, [artist, setlist]);

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
        <TopNavigation
          title={setlist.artist.name.toUpperCase()}
          actionClick={async () => {
            setIsSaved(false);

            const newIsSaved = await loginAndSavePlaylist(
              allSongs,
              setlist,
              artist,
              playlistName,
            );

            if (newIsSaved) {
              setIsSaved(true);
            } else {
              setIsSaved(undefined);
            }
          }}
        />
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
                playlistName={playlistName}
                setPlaylistName={setPlaylistName}
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
        {(isSaved === undefined || isSaved === false) && (
          <Animated.View
            style={[styles.footerContainer]}
            renderToHardwareTextureAndroid
          >
            <View style={styles.saveSetlistButton}>
              <MyPressable
                disabled={isSaved === false}
                onPress={async () => {
                  setIsSaved(false);

                  const newIsSaved = await loginAndSavePlaylist(
                    allSongs,
                    setlist,
                    artist,
                    playlistName,
                  );

                  if (newIsSaved) {
                    setIsSaved(true);
                  } else {
                    setIsSaved(undefined);
                  }
                }}
              >
                {isSaved === undefined ? (
                  <Text style={styles.saveSetlistText}>SAVE SETLIST</Text>
                ) : (
                  <ActivityIndicator
                    style={styles.spinner}
                    size="large"
                    color="white"
                  />
                )}
              </MyPressable>
            </View>
          </Animated.View>
        )}
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
    bottom: 32,
    flexDirection: 'row',
    flex: 1,
    alignSelf: 'center',
    paddingHorizontal: 16,
  },
  saveSetlistButton: {
    // flex: 1,
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
  spinner: { paddingHorizontal: 32, paddingVertical: 8 },
});

export default SetlistDetailScreen;
