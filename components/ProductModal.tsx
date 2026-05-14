import React, { useMemo, useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Platform,
  PanResponder,
} from 'react-native'
import { Product } from '../types'
import { MUSK_SIZES_ML, SPRAY_SIZES_ML } from '../config'
import { useCartStore } from '../store/cartStore'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

interface ProductModalProps {
  product: Product | null
  visible: boolean
  onClose: () => void
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  visible,
  onClose,
}) => {
  const addItem = useCartStore((s) => s.addItem)
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current
  const insets = useSafeAreaInsets()

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 5 // Only trigger on downward swipe
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy)
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 0.5) {
          handleClose()
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 65,
            friction: 11,
          }).start()
        }
      },
    })
  ).current

  const availableTypes = useMemo(() => {
    if (!product) return []
    const types: ('musk' | 'spray')[] = []
    if (product.prices.musk && Object.keys(product.prices.musk).length > 0)
      types.push('musk')
    if (product.prices.spray && Object.keys(product.prices.spray).length > 0)
      types.push('spray')
    return types
  }, [product])

  const [selectedType, setSelectedType] = useState<'musk' | 'spray'>('musk')
  const [selectedMl, setSelectedMl] = useState<number>(0)
  const [addedFeedback, setAddedFeedback] = useState(false)

  useEffect(() => {
    if (product && availableTypes.length > 0) {
      const firstType = availableTypes[0]
      setSelectedType(firstType)
      const prices = product.prices[firstType]
      if (prices) {
        const firstSize = Object.keys(prices)
          .map(Number)
          .sort((a, b) => a - b)[0]
        setSelectedMl(firstSize)
      }
    }
  }, [product, availableTypes])

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start()
    } else {
      slideAnim.setValue(SCREEN_HEIGHT)
    }
  }, [visible, slideAnim])

  const availableSizes = useMemo(() => {
    if (!product) return []
    const prices = product.prices[selectedType]
    if (!prices) return []
    const allSizes: number[] =
      selectedType === 'musk' ? [...MUSK_SIZES_ML] : [...SPRAY_SIZES_ML]
    return allSizes.filter((size) => prices[String(size)] !== undefined)
  }, [product, selectedType])

  const currentPrice = useMemo(() => {
    if (!product) return 0
    const prices = product.prices[selectedType]
    if (!prices) return 0
    return prices[String(selectedMl)] ?? 0
  }, [product, selectedType, selectedMl])

  useEffect(() => {
    if (availableSizes.length > 0 && !availableSizes.includes(selectedMl)) {
      setSelectedMl(availableSizes[0])
    }
  }, [availableSizes, selectedMl])

  const handleAddToCart = () => {
    if (!product || !product.in_stock) return
    addItem(product, selectedType, selectedMl, currentPrice)
    setAddedFeedback(true)
    setTimeout(() => {
      setAddedFeedback(false)
      handleClose()
    }, 800)
  }

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onClose()
    })
  }

  if (!product) return null

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.sheet,
            { 
              transform: [{ translateY: slideAnim }],
              maxHeight: SCREEN_HEIGHT - insets.top,
            },
          ]}
        >
          {/* Handle indicator */}
          <View style={styles.handleContainer} {...panResponder.panHandlers}>
            <View style={styles.handle} />
          </View>

          {/* Close Button */}
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          <ScrollView
            contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 40) }]}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Product Image */}
            <Image
              source={{ uri: product.image_url }}
              style={styles.productImage}
              resizeMode="cover"
            />

            <View style={styles.content}>
              {/* Product Name */}
              <Text style={styles.productName}>{product.name}</Text>

              {/* Description */}
              {product.description ? (
                <Text style={styles.description}>{product.description}</Text>
              ) : null}

              {/* Accords */}
              {product.accords && product.accords.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Accords</Text>
                  <View style={styles.accordsContainer}>
                    {product.accords.map((accord, index) => (
                      <View
                        key={index}
                        style={[
                          styles.accordBar,
                          {
                            backgroundColor: accord.color,
                            width: `${Math.max(
                              30,
                              100 - index * 12
                            )}%` as unknown as number,
                          },
                        ]}
                      >
                        <Text style={styles.accordText}>{accord.name}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Season & Intensity Tags */}
              <View style={styles.tagsRow}>
                {product.season.map((s) => (
                  <View key={s} style={styles.tag}>
                    <Text style={styles.tagText}>{s}</Text>
                  </View>
                ))}
                <View style={[styles.tag, styles.intensityTag]}>
                  <Text style={styles.tagText}>{product.intensity}</Text>
                </View>
              </View>

              {/* Type Selector */}
              {availableTypes.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Type</Text>
                  <View style={styles.typeRow}>
                    {availableTypes.map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.typeButton,
                          selectedType === type && styles.typeButtonActive,
                        ]}
                        onPress={() => setSelectedType(type)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.typeButtonText,
                            selectedType === type &&
                              styles.typeButtonTextActive,
                          ]}
                        >
                          {type === 'musk' ? 'Musk' : 'Spray'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Size Selector */}
              {availableSizes.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Size</Text>
                  <View style={styles.sizeRow}>
                    {availableSizes.map((size) => (
                      <TouchableOpacity
                        key={size}
                        style={[
                          styles.sizeButton,
                          selectedMl === size && styles.sizeButtonActive,
                        ]}
                        onPress={() => setSelectedMl(size)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.sizeButtonText,
                            selectedMl === size && styles.sizeButtonTextActive,
                          ]}
                        >
                          {size}ml
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Price Display */}
              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>Price</Text>
                <Text style={styles.priceValue}>€{currentPrice}</Text>
              </View>

              {/* Add to Cart Button */}
              <TouchableOpacity
                style={[
                  styles.addToCartButton,
                  (!product.in_stock || addedFeedback) &&
                    styles.addToCartButtonDisabled,
                  addedFeedback && styles.addToCartButtonSuccess,
                ]}
                onPress={handleAddToCart}
                disabled={!product.in_stock || addedFeedback}
                activeOpacity={0.8}
              >
                <Text style={styles.addToCartText}>
                  {!product.in_stock
                    ? 'Out of Stock'
                    : addedFeedback
                    ? '✓ Added!'
                    : 'Add to Cart'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: '#0a0a0a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.92,
    overflow: 'hidden',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: -2,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  productImage: {
    width: '100%',
    aspectRatio: 4 / 5,
  },
  content: {
    padding: 20,
  },
  productName: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  description: {
    color: '#888888',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#666666',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  accordsContainer: {
    gap: 6,
  },
  accordBar: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  accordText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  intensityTag: {
    backgroundColor: 'rgba(201,168,76,0.2)',
  },
  tagText: {
    color: '#bbbbbb',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  typeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  typeButtonActive: {
    borderColor: '#c9a84c',
    backgroundColor: 'rgba(201,168,76,0.12)',
  },
  typeButtonText: {
    color: '#888888',
    fontSize: 15,
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: '#c9a84c',
  },
  sizeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  sizeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  sizeButtonActive: {
    borderColor: '#ffffff',
    backgroundColor: '#ffffff',
  },
  sizeButtonText: {
    color: '#888888',
    fontSize: 14,
    fontWeight: '600',
  },
  sizeButtonTextActive: {
    color: '#000000',
    fontWeight: '700',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  priceLabel: {
    color: '#888888',
    fontSize: 16,
    fontWeight: '500',
  },
  priceValue: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '700',
  },
  addToCartButton: {
    backgroundColor: '#c9a84c',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
  },
  addToCartButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  addToCartButtonSuccess: {
    backgroundColor: '#2ecc71',
  },
  addToCartText: {
    color: '#000000',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
})
