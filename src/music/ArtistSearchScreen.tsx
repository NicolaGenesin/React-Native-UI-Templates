import React, { useState } from 'react';
import { View, FlatList, Text, TextInput, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { searchArtistsOnSpotify } from '../util/network';
import MyPressable from '../components/MyPressable';
import ArtistSearchScreenItem from './ArtistSearchScreenItem';
import { SpotifyArtist } from '../design_course/model/types';

const ArtistSearchScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [artists, setArtists] = useState<SpotifyArtist[]>([]);

  return (
    <>
      <View style={{ marginTop: 24 }}>
        <Text style={styles.appLogo}>APP{'\n'}LOGO</Text>
        <Text style={styles.searchTitle}>SEARCH</Text>
        <TextInput
          style={styles.artistSearchInput}
          onChangeText={async text => {
            if (!text.length) {
              return;
            }

            setArtists((await searchArtistsOnSpotify(text)).artists || []);
          }}
          placeholder={'Search for an Artist...'}
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
    </>
  );
};

const styles = StyleSheet.create({
  artistSearchInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 8,
    marginHorizontal: 16,
    paddingHorizontal: 8,
  },
  appLogo: {
    margin: 16,
    fontWeight: 'bold',
    fontSize: 24,
  },
  searchTitle: {
    color: '#333',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 16,
  },
});

export default ArtistSearchScreen;
