import React from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { useCartStore } from '../store/cartStore'
import { CartItemComponent } from '../components/CartItem'
import { STORE_NAME, STORE_WHATSAPP } from '../config'
import { supabase } from '../lib/supabase'
import { useState } from 'react'

export const CartScreen: React.FC = () => {
  const items = useCartStore((s) => s.items)
  const totalPrice = useCartStore((s) => s.totalPrice)
  const totalItems = useCartStore((s) => s.totalItems)
  const incrementItem = useCartStore((s) => s.incrementItem)
  const decrementItem = useCartStore((s) => s.decrementItem)
  const removeItem = useCartStore((s) => s.removeItem)
  const clearCart = useCartStore((s) => s.clearCart)
  const insets = useSafeAreaInsets()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleWhatsAppOrder = async () => {
    if (items.length === 0) return

    setIsSubmitting(true)
    try {
      // 1. Generate Order Number
      const orderNumber = 'TN-' + Math.random().toString(36).substring(2, 8).toUpperCase()

      // 2. Prepare Order Items
      const orderItems = items.map(item => ({
        name: item.product.name,
        type: item.type,
        ml: item.ml,
        price: item.price,
        quantity: item.quantity,
        image_url: item.product.image_url,
      }))

      // 3. Save to Supabase
      const { error } = await supabase.from('orders').insert({
        order_number: orderNumber,
        items: orderItems,
        total_price: totalPrice(),
        status: 'pending'
      })

      if (error) throw error

      // 4. Generate WhatsApp Message
      const itemLines = items
        .map(
          (item) =>
            `- ${item.product.name} | ${item.type === 'musk' ? 'Musk' : 'Spray'} ${item.ml}ml x${item.quantity} — ${item.price * item.quantity} DEN`
        )
        .join('\n')

      const message = `🌿 ${STORE_NAME} — New Order\nOrder No: ${orderNumber}\n\n${itemLines}\n\n💰 Total: ${totalPrice()} DEN\n\nView your order details here:\nhttp://172.20.10.3:5173/order/${orderNumber}\n\nPlease confirm my order. Thank you!`

      const url = `https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(message)}`
      
      const canOpen = await Linking.canOpenURL(url)
      if (canOpen) {
        await Linking.openURL(url)
        clearCart()
      } else {
        Alert.alert('Error', 'Could not open WhatsApp')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      Alert.alert('Error', 'Failed to create order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <View style={[styles.emptyContainer, { paddingTop: insets.top }]}>
        <StatusBar style="light" />
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>
          Browse our collection and add your favorite fragrances
        </Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Your Cart</Text>
          <Text style={styles.headerCount}>
            {totalItems()} {totalItems() === 1 ? 'item' : 'items'}
          </Text>
        </View>
        <TouchableOpacity onPress={clearCart} activeOpacity={0.7}>
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {/* Cart Items */}
      <FlatList
        data={items}
        keyExtractor={(item) => `${item.product.id}-${item.type}-${item.ml}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <CartItemComponent
            item={item}
            onIncrement={() =>
              incrementItem(item.product.id, item.type, item.ml)
            }
            onDecrement={() =>
              decrementItem(item.product.id, item.type, item.ml)
            }
            onRemove={() => removeItem(item.product.id, item.type, item.ml)}
          />
        )}
      />

      {/* Sticky Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{totalPrice()} DEN</Text>
        </View>
        <TouchableOpacity
          style={[styles.orderButton, isSubmitting && { opacity: 0.7 }]}
          onPress={handleWhatsAppOrder}
          activeOpacity={0.85}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <Text style={styles.orderButtonText}>Order via WhatsApp</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
    opacity: 0.6,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#666666',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '700',
  },
  headerCount: {
    color: '#888888',
    fontSize: 14,
    marginTop: 2,
  },
  clearText: {
    color: '#ff6b6b',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  bottomBar: {
    backgroundColor: '#0a0a0a',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  totalLabel: {
    color: '#888888',
    fontSize: 16,
    fontWeight: '500',
  },
  totalValue: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '700',
  },
  orderButton: {
    backgroundColor: '#c9a84c',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
  },
  orderButtonText: {
    color: '#000000',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
})
