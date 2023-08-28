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
import Config from '../Config';
import { FMSetlist, FMSongEntity } from '../design_course/model/types';
import moment from 'moment';

const infoHeight = 364.0;

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

const SetlistDetailScreen: React.FC = props => {
  const window = useWindowDimensions();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const favIconScale = useRef<Animated.Value>(new Animated.Value(0.1));
  const opacity1 = useRef<Animated.Value>(new Animated.Value(0));
  const opacity2 = useRef<Animated.Value>(new Animated.Value(0));
  const opacity3 = useRef<Animated.Value>(new Animated.Value(0));

  const setlist: FMSetlist = props.route.params.setlist;
  const [allSongs, setAllSongs] = useState<FMSongEntity[]>([]);

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
          const durationInSeconds =
            searchResult.tracks.items[0]?.duration_ms / 1000;
          const trackImageUrl =
            searchResult.tracks.items[0]?.album?.images?.[1].url;

          // console.log(JSON.stringify(searchResult.tracks.items[0], null, 2));

          // enrich song with spotify data
          song.spotifyId = trackId;
          song.spotifyImageUrl = trackImageUrl;
          song.spotifyAlbumName = searchResult.tracks.items[0]?.album?.name;
          song.duration = durationInSeconds;

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

  // console.log('allsongszdd', allSongs);

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

  const spotifySongsFound = allSongs.filter(song => !!song.spotifyId);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar backgroundColor="transparent" barStyle="dark-content" />
      <View style={[styles.contentContainer]}>
        <View
          style={[
            styles.header,
            { height: 52 + insets.top, paddingTop: insets.top },
          ]}
        >
          <View style={styles.headerLeft}>
            <MyPressable
              style={{ padding: 8 }}
              android_ripple={{ color: 'grey', radius: 20, borderless: true }}
              onPress={navigation.goBack}
            >
              <Icon name="arrow-back" size={25} color="black" />
            </MyPressable>
          </View>
          <View
            style={{
              marginHorizontal: 16,
              maxWidth: window.width - 16 - 32 - 41 - 74, // 16, 32:- total padding/margin; 41, 74:- left and right view's width
            }}
          >
            <Text style={styles.headerTitle} numberOfLines={1}>
              {setlist.artist.name.toUpperCase()}
            </Text>
          </View>
          <View style={styles.headerRight}>
            {/* <Icon
              style={{ paddingRight: 8 }}
              name="favorite-border"
              size={25}
              color="black"
            /> */}
            <Icon
              style={{ paddingHorizontal: 8 }}
              name="ios-share"
              size={25}
              color="black"
            />
          </View>
        </View>
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
              uri: 'https://www.rollingstone.co.uk/wp-content/uploads/sites/2/2022/01/PLACEBO_PRESS.01-Credit-Mads-Perch-1024x451.jpg',
            }}
            style={styles.imageBackground}
            resizeMode="cover"
            imageStyle={{ opacity: 0.55 }}
          >
            <ImageBackground
              source={require('../detail-dots.png')}
              style={styles.imageBackground}
              resizeMode="stretch"
              imageStyle={{ opacity: 12 }}
            >
              <View style={styles.topSectionContainer}>
                {/* <Text style={styles.title}>
                  {setlist.artist.name.toUpperCase()}
                </Text> */}
                {/* <View style={styles.priceRatingContainer}></View> */}
                <Text style={styles.venue}>
                  {setlist.venue.name}
                  {/* - {setlist.venue.city.name} */}
                </Text>
                <Text style={styles.time}>
                  {moment(setlist.eventDate, 'DD-MM-YYYY').format(
                    'MMM DD, YYYY',
                  )}
                </Text>
                <View style={styles.durationAvailabilityContainer}>
                  <View style={styles.durationContainer}>
                    <Text style={styles.durationTitle}>DURATION</Text>
                    <Text style={styles.durationContent}>
                      {formatTime(
                        allSongs.reduce((acc, song) => {
                          return acc + (song.duration || 0);
                        }, 0),
                      )}
                    </Text>
                  </View>
                  <View style={styles.availabilityContainer}>
                    <Text style={styles.availabilityTitle}>
                      TRACK AVAILABILITY
                    </Text>
                    <Text style={styles.availabilityContent}>
                      {spotifySongsFound.length}/{allSongs.length}
                    </Text>
                  </View>
                </View>
                {!!setlist.tour?.name && (
                  <Animated.Text style={styles.tour}>
                    TOUR: {setlist.tour.name.toUpperCase()}
                  </Animated.Text>
                )}
              </View>
            </ImageBackground>
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
                      <Text style={styles.albumName}>
                        {item.spotifyAlbumName}
                      </Text>
                    </View>
                  </View>
                );
              }}
            />
          </Animated.View>
        </ScrollView>
        <Animated.View
          style={[styles.footerContainer]}
          renderToHardwareTextureAndroid
        >
          <View style={styles.saveSetlistButton}>
            <MyPressable>
              <Text style={styles.saveSetlistText}>SAVE SETLIST</Text>
            </MyPressable>
          </View>
        </Animated.View>
      </View>

      {/* <View style={[styles.backBtnContainer, { marginTop }]}>
        <MyPressable
          style={[]}
          android_ripple={{ color: 'darkgrey', borderless: true, radius: 28 }}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back-ios" size={24} color="black" />
        </MyPressable>
      </View> */}
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
  topSectionContainer: { paddingHorizontal: 16, paddingVertical: 16 },
  scrollContainer: {},
  // title: {
  //   color: 'black',
  //   fontSize: 22,
  //   marginTop: 32,
  //   fontWeight: 'bold',
  // },
  venue: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 18,
  },
  time: {
    color: 'black',
    fontSize: 14,
  },
  tour: {
    color: 'gray',
    fontSize: 10,
  },
  setlistTitle: {
    color: 'gray',
    fontSize: 16,
    marginTop: 16,
    fontWeight: 'bold',
    paddingHorizontal: 16,
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
  listContainer: { marginTop: 8, paddingHorizontal: 16 },
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
  durationTitle: { color: '#333', fontSize: 12, fontWeight: 'bold' },
  durationContent: { color: 'black', fontSize: 24, fontWeight: 'bold' },
  availabilityContainer: { marginRight: 8 },
  availabilityTitle: { color: '#333', fontSize: 12, fontWeight: 'bold' },
  availabilityContent: { color: 'black', fontSize: 24, fontWeight: 'bold' },
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
    position: 'absolute',
    bottom: 16,
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
  saveSetlistButton: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: '#489',
    elevation: 4,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'lightgrey',
  },
  headerLeft: {
    alignItems: 'flex-start',
    flexGrow: 1,
    flexBasis: 0,
  },
  headerTitle: {
    color: 'black',
    fontSize: 22,
    fontFamily: 'WorkSans-SemiBold',
    textAlign: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexGrow: 1,
    flexBasis: 0,
  },
});

export default SetlistDetailScreen;
