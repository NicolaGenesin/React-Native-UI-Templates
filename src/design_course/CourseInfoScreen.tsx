import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  StatusBar,
  ImageBackground,
  useWindowDimensions,
  Image,
  Platform,
  Animated,
  Easing,
  FlatList,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MyPressable from '../components/MyPressable';
import { AppImages } from '../assets';
import Config from '../Config';
import { FMSetlist, FMSongEntity } from './model/types';
import moment from 'moment';

const infoHeight = 364.0;

const CourseInfoScreen: React.FC = props => {
  const window = useWindowDimensions();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const favIconScale = useRef<Animated.Value>(new Animated.Value(0.1));
  const opacity1 = useRef<Animated.Value>(new Animated.Value(0));
  const opacity2 = useRef<Animated.Value>(new Animated.Value(0));
  const opacity3 = useRef<Animated.Value>(new Animated.Value(0));

  const setlist: FMSetlist = props.route.params.setlist;
  const [allSongs, setAllSongs] = useState<FMSongEntity[]>([]);

  // const tempHeight = window.height - window.width / 1.2 + 24.0;
  const marginTop = Config.isIos
    ? Math.max(insets.top, 20)
    : StatusBar.currentHeight;

  const compareWithSpotify = async (
    songs: FMSongEntity[],
    artist: string,
    accessToken: string,
  ) => {
    try {
      for (const song of songs) {
        const query = `${song.name} ${artist}`;
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

          // enrich song with spotify data
          song.spotifyId = trackId;
          song.spotifyImageUrl = trackImageUrl;

          // console.log(query, trackId, trackImageUrl);
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

    console.log('here');

    setAllSongs(songs);
  };

  console.log('allsongszdd', allSongs);

  useEffect(() => {
    if (setlist) {
      const allSongsTmp: FMSongEntity[] = [];

      (setlist.sets.set || []).forEach(section => {
        if (section.song) {
          section.song.forEach(song => {
            if (song.name) {
              allSongsTmp.push({
                name: song.name,
                encore: !!section.encore,
              });
            }
          });
        }
      });

      compareWithSpotify(
        allSongsTmp,
        setlist.artist.name,
        props.route.params.accessToken, // todo this needs to change, we want to let people login from the detail page
      );
    }
  }, [setlist]);

  useEffect(() => {
    Animated.timing(favIconScale.current, {
      toValue: 1,
      duration: 1000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    Animated.parallel([
      Animated.timing(opacity1.current, {
        toValue: 1,
        duration: 500,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity2.current, {
        toValue: 1,
        duration: 500,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.timing(opacity3.current, {
        toValue: 1,
        duration: 500,
        delay: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar backgroundColor="transparent" barStyle="dark-content" />
      <View style={[styles.contentContainer]}>
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={{
            flexGrow: 1,
            minHeight: infoHeight,
            // maxHeight: tempHeight > infoHeight ? tempHeight : infoHeight,
          }}
        >
          <ImageBackground
            source={{
              uri: 'https://e1.pxfuel.com/desktop-wallpaper/150/709/desktop-wallpaper-placebo-high-quality-placebo.jpg',
            }}
            style={styles.imageBackground}
            imageStyle={{ opacity: 0.15 }}
          >
            <Text style={styles.title}>
              {setlist.artist.name.toUpperCase()}
            </Text>
            {/* <View style={styles.priceRatingContainer}></View> */}
            <Text style={styles.venue}>
              {setlist.venue.name}
              {/* - {setlist.venue.city.name} */}
            </Text>
            <Text style={styles.time}>
              {moment(setlist.eventDate, 'DD-MM-YYYY').format('MMM DD, YYYY')}
            </Text>
            <View style={styles.durationAvailabilityContainer}>
              <View style={styles.durationContainer}>
                <Text style={styles.durationTitle}>DURATION</Text>
                <Text style={styles.durationContent}>1h 8m</Text>
              </View>
              <View style={styles.availabilityContainer}>
                <Text style={styles.availabilityTitle}>TRACK AVAILABILITY</Text>
                <Text style={styles.availabilityContent}>
                  All tracks are available
                </Text>
              </View>
            </View>
            {!!setlist.tour.name && (
              <Animated.Text style={styles.tour}>
                TOUR: {setlist.tour.name.toUpperCase()}
              </Animated.Text>
            )}
          </ImageBackground>
          <Text style={styles.setlistTitle}>SETLIST</Text>

          <Animated.View
            style={[styles.listContainer, { opacity: opacity1.current }]}
            renderToHardwareTextureAndroid
          >
            <FlatList
              data={allSongs}
              keyExtractor={item => item.name}
              renderItem={({ item, index }) => {
                return (
                  <View style={styles.itemContainer}>
                    <View>
                      <Image
                        style={{ height: 40, width: 40, marginEnd: 8 }}
                        source={{
                          uri:
                            item.spotifyImageUrl ||
                            'https://st3.depositphotos.com/17828278/33150/v/450/depositphotos_331503262-stock-illustration-no-image-vector-symbol-missing.jpg',
                        }}
                        resizeMode="stretch"
                      />
                      <View style={styles.trackIndexContainer}>
                        <Text style={styles.trackIndex}>{index + 1}</Text>
                      </View>
                    </View>
                    <View>
                      <View style={styles.itemNameContainer}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        {item.encore && (
                          <View style={styles.tagContainer}>
                            <Text style={styles.tagText}>ENCORE</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.albumName}>Album Name</Text>
                    </View>
                  </View>
                );
              }}
            />
          </Animated.View>
        </ScrollView>
        <Animated.View
          style={[
            styles.footerContainer,
            { paddingBottom: insets.bottom + 16, opacity: opacity3.current },
          ]}
          renderToHardwareTextureAndroid
        >
          <View style={styles.joinCourse}>
            <MyPressable>
              <Text style={styles.saveSetlistText}>SAVE SETLIST</Text>
            </MyPressable>
          </View>
        </Animated.View>
      </View>

      <View style={[styles.backBtnContainer, { marginTop }]}>
        <MyPressable
          style={[]}
          android_ripple={{ color: 'darkgrey', borderless: true, radius: 28 }}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back-ios" size={24} color="black" />
        </MyPressable>
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
  scrollContainer: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 8,
  },
  title: {
    color: 'black',
    fontSize: 22,
    marginTop: 32,
    fontWeight: 'bold',
  },
  venue: {
    color: 'gray',
    fontWeight: 'bold',
    fontSize: 18,
  },
  time: {
    color: 'gray',
    fontSize: 14,
  },
  tour: {
    color: 'gray',
    fontSize: 10,
    marginBottom: 8,
  },
  setlistTitle: {
    color: 'gray',
    fontSize: 16,
    marginTop: 16,
    fontWeight: 'bold',
  },
  trackIndexContainer: {
    position: 'absolute',
    backgroundColor: 'black',
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackIndex: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  listContainer: { marginTop: 8 },
  itemContainer: {
    flexDirection: 'row',
    paddingVertical: 4,
    alignItems: 'center',
  },
  itemNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationContainer: { marginRight: 8 },
  durationTitle: { color: 'gray', fontSize: 12, fontWeight: 'bold' },
  durationContent: { color: 'black', fontSize: 16, fontWeight: 'bold' },
  availabilityContainer: { marginRight: 8 },
  availabilityTitle: { color: 'gray', fontSize: 12, fontWeight: 'bold' },
  availabilityContent: { color: 'black', fontSize: 16, fontWeight: 'bold' },
  durationAvailabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  itemName: {
    marginRight: 4,
    fontWeight: 'bold',
  },
  albumName: {
    marginRight: 4,
    color: 'gray',
  },
  tagContainer: {
    backgroundColor: '#007bff', // Blue color
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  tagText: {
    color: 'white', // White text color
    fontSize: 8,
    fontWeight: 'bold',
  },
  price: {
    flex: 1,
    color: 'rgb(0, 182, 240)',
  },
  textStyle: {
    fontSize: 22,
    color: 'darkslategrey',
    letterSpacing: 0.27,
  },
  footerContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    // paddingBottom: 16,
  },
  addView: {
    width: 48,
    height: 48,
    borderColor: 'lightgrey',
    borderWidth: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinCourse: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: 'rgb(0, 182, 240)',
    elevation: 4,
    shadowColor: 'rgb(0, 182, 240)',
    shadowOffset: { width: 1.1, height: 1.1 },
    shadowOpacity: 0.5,
    shadowRadius: 10.0,
    ...Platform.select({ android: { overflow: 'hidden' } }),
  },
  saveSetlistText: {
    padding: 18,
    paddingVertical: 12,
    fontSize: 18,
    alignSelf: 'center',
    color: 'white',
  },
  favoriteIcon: {
    position: 'absolute',
    right: 35,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgb(0, 182, 240)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 18,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
  },
  backBtnContainer: {
    position: 'absolute',
    width: '100%',
    height: 32,
    // backgroundColor: 'yellow',
  },
  imageBackground: {},
});

export default CourseInfoScreen;
