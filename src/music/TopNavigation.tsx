import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MyPressable from '../components/MyPressable';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TopNavigation = ({ title }: { title: string }) => {
  const window = useWindowDimensions();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
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
          {title}
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
          name="save-alt"
          size={25}
          color="black"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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

export default TopNavigation;
