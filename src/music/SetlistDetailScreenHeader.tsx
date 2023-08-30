import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  StatusBar,
  ImageBackground,
  Image,
  Platform,
  Animated,
  Easing,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { getPreviewOverlay } from '../util/network';
import moment from 'moment';
import {
  SpotifyArtist,
  FMSetlist,
  FMSongEntity,
} from '../design_course/model/types';

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  let formattedTime = '';

  if (hours > 0) {
    formattedTime += `${hours}h `;
  }

  if (minutes > 0 || hours === 0) {
    formattedTime += `${minutes}m`;
  }

  return formattedTime;
};

const SetlistDetailScreenHeader = React.memo(
  ({
    artist,
    setlist,
    allSongs,
  }: {
    artist: SpotifyArtist;
    setlist: FMSetlist;
    allSongs: FMSongEntity[];
  }) => {
    const imageOpacity = useRef<Animated.Value>(new Animated.Value(0));
    const [image, setImage] = useState<string>('');

    useEffect(() => {
      (async () => {
        if (artist && setlist) {
          const base64Image: string = (await getPreviewOverlay(
            artist.images?.[0]?.url as string,
            artist.name,
            setlist.venue.name,
            setlist.eventDate,
          )) as string;

          setImage('data:image/jpeg;base64,' + base64Image);

          Animated.timing(imageOpacity.current, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }
      })();
    }, [artist, setlist]);

    return (
      <>
        <ImageBackground
          source={{
            uri: artist.images?.[0]?.url,
          }}
          style={styles.imageBackground}
          resizeMode="cover"
          imageStyle={{ opacity: 0.2 }}
        >
          <View style={styles.topSectionContainer}>
            <View style={styles.leftSectionContainer}>
              <Text style={styles.venue}>{setlist.venue.name}</Text>
              <Text style={styles.time}>
                {moment(setlist.eventDate, 'DD-MM-YYYY').format('MMM DD, YYYY')}
              </Text>
              <View style={styles.availabilityContainer}>
                <Text style={styles.availabilityTitle}>TRACKS AVAILABLE</Text>
                {allSongs.length ? (
                  <Text style={styles.availabilityContent}>
                    {allSongs.filter(song => !!song.spotifyData?.id).length}/
                    {allSongs.length}
                    {' ~ '}
                    {formatTime(
                      allSongs.reduce((acc, song) => {
                        return acc + (song.spotifyData?.duration || 1) / 1000;
                      }, 0),
                    )}
                  </Text>
                ) : (
                  <View style={styles.loadingIndicatorTracks}>
                    <ActivityIndicator size="small" color="black" />
                  </View>
                )}
              </View>
              {!!setlist.tour?.name && (
                <Animated.Text style={styles.tour}>
                  {setlist.tour.name.toUpperCase()}
                </Animated.Text>
              )}
            </View>
            {!!image.length && (
              <Animated.View
                style={{ opacity: imageOpacity.current }}
                renderToHardwareTextureAndroid
              >
                <Image
                  style={{ height: 100, width: 100 }}
                  source={{
                    uri: image,
                  }}
                  resizeMode="stretch"
                />
              </Animated.View>
            )}
          </View>
        </ImageBackground>
        <Text style={styles.setlistTitle}>TRACKS PLAYED DURING EVENT</Text>
      </>
    );
  },
);

const styles = StyleSheet.create({
  imageBackground: {},
  topSectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  leftSectionContainer: {},
  venue: {
    maxWidth: 250,
    color: 'black',
    fontWeight: 'bold',
    fontSize: 18,
  },
  time: {
    marginTop: 4,
    color: '#333',
    fontWeight: 'bold',
    fontSize: 14,
  },
  tour: {
    color: '#333',
    fontSize: 10,
    fontWeight: '500',
  },
  setlistTitle: {
    color: '#333',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  availabilityContainer: { marginVertical: 8 },
  availabilityTitle: { color: '#333', fontSize: 12, fontWeight: 'bold' },
  availabilityContent: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  loadingIndicatorTracks: {
    marginTop: 6,
    alignItems: 'flex-start',
  },
});

export default SetlistDetailScreenHeader;
