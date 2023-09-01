import React from 'react';
import { useRef, useEffect } from 'react';
import { View, Image, Text, Animated } from 'react-native';
import { FMSongEntity } from '../design_course/model/types';
import { StyleSheet } from 'react-native';

const SetlistDetailScreenItem = ({
  item,
  index,
}: {
  item: FMSongEntity;
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

  return (
    <Animated.View style={{ ...styles.itemContainer, opacity }}>
      <View>
        <Image
          style={{ height: 40, width: 40, marginEnd: 8 }}
          source={{
            uri: item.spotifyData?.albumImageUrl,
          }}
          defaultSource={require('../assets/placeholder.png')}
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
        <Text style={styles.albumName}>{item.spotifyData?.albumName}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 4,
    alignItems: 'center',
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
  itemNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemName: {
    fontWeight: 'bold',
    marginBottom: 2,
    flexShrink: 1,
  },
  tagContainer: {
    backgroundColor: '#33BBC5',
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginLeft: 8,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  tagText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
  },
  albumName: {
    color: '#333',
  },
});

export default SetlistDetailScreenItem;
