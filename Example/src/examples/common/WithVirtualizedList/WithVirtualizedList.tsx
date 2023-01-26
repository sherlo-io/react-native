import React from 'react'
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  VirtualizedList,
} from 'react-native'

const DATA = []

const getItem = (data, index) => ({
  id: Math.random().toString(12).substring(0),
  title: `Item ${index + 1}`,
})

const getItemCount = (data) => 10

const Item = ({ title }) => (
  <View style={styles.item}>
    <Text style={styles.title}>{title}</Text>
  </View>
)

const WithVirtualizedList = () => {
  return (
    <VirtualizedList
      data={DATA}
      initialNumToRender={4}
      renderItem={({ item }) => <Item title={item.title} />}
      keyExtractor={(item) => item.key}
      getItemCount={getItemCount}
      getItem={getItem}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight,
  },
  item: {
    backgroundColor: '#f9c2ff',
    height: 150,
    justifyContent: 'center',
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 20,
  },
  title: {
    fontSize: 32,
  },
})

export default WithVirtualizedList
