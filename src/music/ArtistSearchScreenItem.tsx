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
        style={{ height: 40, width: 40, marginEnd: 8 }}
        source={{
          uri:
            item.images?.[0]?.url ||
            'https://st3.depositphotos.com/17828278/33150/v/450/depositphotos_331503262-stock-illustration-no-image-vector-symbol-missing.jpg',
        }}
        resizeMode="stretch"
      />
      <Animated.View style={{ flex: 1 }}>
        <Text style={styles.itemName}>{item.name}</Text>
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
  itemName: {
    fontWeight: 'bold',
    paddingRight: 16,
    marginBottom: 2,
    flexShrink: 1,
  },
  genres: {
    fontSize: 9,
    flexShrink: 1,
  },
});

export default ArtistSearchScreenItem;
