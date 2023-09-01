import React from 'react';
import { useRef, useEffect } from 'react';
import { Image, Text, Animated } from 'react-native';
import { SpotifyArtist } from '../design_course/model/types';
import { StyleSheet } from 'react-native';

const ArtistSearchScreenItem = ({
  item,
  index,
}: {
  item: SpotifyArtist;
  index: number;
}) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 500,
      delay: 25 * index,
      useNativeDriver: true,
    }).start();
  }, []);

  // Capitalize first letter of each word in genres
  const genres = item.genres
    ?.map(genre => {
      return genre.charAt(0).toUpperCase() + genre.slice(1);
    })
    .join(', ');

  return (
    <Animated.View style={{ ...styles.itemContainer, opacity }}>
      <Image
        style={styles.image}
        source={{
          uri: item.images?.[0]?.url,
        }}
        defaultSource={require('../assets/placeholder.png')}
        resizeMode="stretch"
      />
      <Animated.View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.genres}>{genres}</Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  name: {
    fontWeight: 'bold',
    paddingRight: 16,
    marginBottom: 2,
    flexShrink: 1,
  },
  image: { height: 40, width: 40, marginEnd: 8 },
  genres: {
    fontSize: 9,
    flexShrink: 1,
  },
});

export default ArtistSearchScreenItem;
