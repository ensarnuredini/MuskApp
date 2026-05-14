import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ImageBackground,
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { STORE_NAME } from '../config'
import { Gender } from '../types'

export type CatalogStackParamList = {
  Home: undefined
  Products: { gender: Gender }
}

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<CatalogStackParamList, 'Home'>
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')
const CARD_SIZE = (SCREEN_WIDTH - 56) / 2

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header area */}
      <View style={styles.header}>
        {/* Decorative ornament */}
        <Text style={styles.ornament}>✦</Text>
        <Text style={styles.storeName}>{STORE_NAME}</Text>
        <Text style={styles.subtitle}>عطور فاخرة</Text>
        <Text style={styles.subtitleEn}>Premium Fragrances</Text>
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerDot}>◆</Text>
          <View style={styles.dividerLine} />
        </View>
      </View>

      {/* Gender Selection Cards */}
      <View style={styles.cardsContainer}>
        <TouchableOpacity
          style={styles.genderCard}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Products', { gender: 'male' })}
        >
          <View style={styles.cardInner}>
            <Text style={styles.cardEmoji}>♛</Text>
            <Text style={styles.cardTitle}>For Him</Text>
            <Text style={styles.cardSubtitle}>Masculine Scents</Text>
          </View>
          <View style={styles.cardBorderOverlay} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.genderCard}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Products', { gender: 'female' })}
        >
          <View style={styles.cardInner}>
            <Text style={styles.cardEmoji}>♕</Text>
            <Text style={styles.cardTitle}>For Her</Text>
            <Text style={styles.cardSubtitle}>Feminine Scents</Text>
          </View>
          <View style={styles.cardBorderOverlay} />
        </TouchableOpacity>
      </View>

      {/* Bottom decorative text */}
      <Text style={styles.bottomText}>Discover your signature scent</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  ornament: {
    color: '#c9a84c',
    fontSize: 24,
    marginBottom: 12,
    opacity: 0.8,
  },
  storeName: {
    color: '#ffffff',
    fontSize: 38,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  subtitle: {
    color: '#c9a84c',
    fontSize: 22,
    marginTop: 8,
    fontWeight: '300',
    letterSpacing: 4,
  },
  subtitleEn: {
    color: '#555555',
    fontSize: 13,
    marginTop: 6,
    letterSpacing: 4,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 10,
  },
  dividerLine: {
    width: 50,
    height: 1,
    backgroundColor: 'rgba(201,168,76,0.3)',
  },
  dividerDot: {
    color: '#c9a84c',
    fontSize: 10,
    opacity: 0.6,
  },
  cardsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  genderCard: {
    width: CARD_SIZE,
    aspectRatio: 3 / 4,
    backgroundColor: '#0d0d0d',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  cardInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardEmoji: {
    fontSize: 40,
    color: '#c9a84c',
    marginBottom: 16,
    opacity: 0.9,
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  cardSubtitle: {
    color: '#666666',
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  cardBorderOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.2)',
  },
  bottomText: {
    color: '#444444',
    fontSize: 12,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginTop: 48,
    fontWeight: '500',
  },
})
