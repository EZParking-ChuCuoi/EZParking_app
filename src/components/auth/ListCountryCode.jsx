import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React from 'react';
import EZContainer from '../core/EZContainer';
import EZText from '../core/EZText';
import {UseGetCountriesCode} from '../../hooks/getCountriesCode';
import {COLORS} from '../../assets/styles/styles';
const ListCountryCode = () => {
  const {data, isLoading} = UseGetCountriesCode();
  const renderItem = ({item}) => {
    return (
      <View style={styles.item}>
        <EZText>{item.countryName}</EZText>
        <EZText>{item.countryCode}</EZText>
      </View>
    );
  };
  if (isLoading) {
    return (
      <EZContainer>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </EZContainer>
    );
  }
  return (
    <EZContainer styleEZContainer={{paddingTop: 20, paddingHorizontal: 15}}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
      />
    </EZContainer>
  );
};

export default ListCountryCode;

const styles = StyleSheet.create({
  item: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderInput,
  },
});
