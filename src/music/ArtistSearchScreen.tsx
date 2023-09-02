import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Image,
  FlatList,
  Text,
  TextInput,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { searchArtistsOnSpotify } from '../util/network';
import MyPressable from '../components/MyPressable';
import ArtistSearchScreenItem from './ArtistSearchScreenItem';
import { SpotifyArtist } from '../design_course/model/types';
import randomArtists from '../util/randomArtists';

const ArtistSearchScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [artists, setArtists] = useState<SpotifyArtist[]>([]);
  const latestQuery = useRef<string>('');
  const textInputRef = useRef<TextInput | null>(null); // Create a ref for the TextInput

  // change TextInput placeholder text by picking a random randomArtists every 3 seconds
  const [randomArtistIndex, setRandomArtistIndex] = useState<number>(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setRandomArtistIndex(prevIndex => {
        const newIndex = (prevIndex + 1) % randomArtists.length;
        return newIndex;
      });
    }, 3000);

    if (textInputRef.current) {
      textInputRef.current.focus();
    }

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={{ marginTop: 48, marginBottom: 8 }}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/logo-black.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.searchTitle}>SEARCH ARTIST</Text>
        <TextInput
          autoCorrect={false}
          style={styles.artistSearchInput}
          onChangeText={async text => {
            if (!text.length) {
              return;
            }

            latestQuery.current = text;

            const response = await searchArtistsOnSpotify(text);

            // Check if this response is for the latest query
            if (text === latestQuery.current) {
              const newArtists = response.artists || [];

              // move new artists having 'name' that partially matches 'text' to the top of the list
              const textLower = text.toLowerCase();
              newArtists.sort((a: SpotifyArtist, b: SpotifyArtist) => {
                const aNameLower = a.name.toLowerCase();
                const bNameLower = b.name.toLowerCase();

                if (aNameLower.startsWith(textLower)) {
                  return -1;
                } else if (bNameLower.startsWith(textLower)) {
                  return 1;
                } else {
                  return 0;
                }
              });

              setArtists(newArtists);
            }
          }}
          placeholder={randomArtists[randomArtistIndex]}
          ref={textInputRef}
        />
      </View>
      <FlatList
        data={artists}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <MyPressable
            style={{ marginTop: 8 }}
            onPress={() => {
              navigation.navigate('SetlistsSearchScreen', {
                artist: item,
              });
            }}
          >
            <ArtistSearchScreenItem item={item} index={index} />
          </MyPressable>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  artistSearchInput: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
    paddingBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginHorizontal: 16,
    marginTop: 8,
  },
  searchTitle: {
    color: '#333',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 16,
  },
  logoContainer: {},
  logo: {
    marginLeft: 16,
    marginVertical: 16,
    width: 100,
    height: 60,
  },
});

export default ArtistSearchScreen;
