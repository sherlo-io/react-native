import React from 'react'
import { SafeAreaView, StyleSheet, TextInput } from 'react-native'

interface Props {
  autoFocus?: boolean
  text: string
}

const WithTextInput = ({ autoFocus, text }: Props) => {
  return (
    <SafeAreaView>
      <TextInput
        style={styles.input}
        value={text}
        autoFocus={autoFocus}
        placeholder='placeholder'
        keyboardType='numeric'
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
})

export default WithTextInput
