import React from 'react';
import { useRef, useEffect } from 'react';
import { View, Text, Animated } from 'react-native';
import { FMSetlist } from '../design_course/model/types';
import { StyleSheet } from 'react-native';
import moment from 'moment';

const SetlistsSearchScreenItem = ({
  item,
  index,
}: {
  item: FMSetlist;
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
        <Text style={styles.venue}>{item.venue.name}</Text>
        <Text style={styles.eventDateAndTour}>
          {moment(item.eventDate, 'DD-MM-YYYY').format('MMM DD, YYYY')}
          {item.tour?.name ? ' - ' + item.tour?.name : ''}
        </Text>
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
  venue: {
    fontWeight: 'bold',
    marginBottom: 2,
    flexShrink: 1,
  },
  eventDateAndTour: {
    color: '#333',
    flexShrink: 1,
  },
});

export default SetlistsSearchScreenItem;
