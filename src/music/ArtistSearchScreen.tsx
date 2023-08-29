import React, { useState } from 'react';
import { View, Text, Image, FlatList, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { searchArtistsOnSpotify } from '../util/network';
import MyPressable from '../components/MyPressable';

const ArtistSearchScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [artists, setArtists] = useState<any[]>([]);

  return (
    <>
      <View style={{ marginTop: 24 }}>
        {/* <Button title="Search Setlists" onPress={searchSetlists} /> */}

        <TextInput
          style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
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
        renderItem={({ item }) => (
          <MyPressable
            style={{ marginTop: 8 }}
            onPress={() => {
              navigation.navigate('SetlistsSearchScreen', {
                artist: item,
              });
            }}
          >
            <Image
              style={{ height: 40, width: 40, marginEnd: 8 }}
              source={{
                uri:
                  item.images?.[0]?.url ||
                  'https://st3.depositphotos.com/17828278/33150/v/450/depositphotos_331503262-stock-illustration-no-image-vector-symbol-missing.jpg',
              }}
              resizeMode="stretch"
            />
            <Text>{item.name}</Text>
          </MyPressable>
        )}
      />
    </>
  );
};

export default ArtistSearchScreen;
