import React from 'react'
import { SafeAreaView, StyleSheet, Text } from 'react-native'

const WithSafeAreaView = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Page content</Text>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    fontSize: 25,
    fontWeight: '500',
  },
})

export default WithSafeAreaView
