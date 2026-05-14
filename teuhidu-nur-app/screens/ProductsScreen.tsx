import React, { useEffect, useState, useMemo } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { CatalogStackParamList } from './HomeScreen'
import { Product } from '../types'
import { supabase } from '../lib/supabase'
import { ProductCard } from '../components/ProductCard'
import { ProductModal } from '../components/ProductModal'
import { FilterBar, ActiveFilters } from '../components/FilterBar'

type ProductsScreenProps = NativeStackScreenProps<CatalogStackParamList, 'Products'>

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export const ProductsScreen: React.FC<ProductsScreenProps> = ({ route }) => {
  const { gender } = route.params
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [filters, setFilters] = useState<ActiveFilters>({
    season: [],
    scent_family: [],
    intensity: [],
    occasion: [],
  })

  useEffect(() => {
    fetchProducts()
  }, [gender])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .or(`gender.eq.${gender},gender.eq.unisex`)
        .eq('in_stock', true)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setProducts((data as Product[]) ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // AND between categories, OR within a category
      if (
        filters.season.length > 0 &&
        !filters.season.some((s) => product.season.includes(s))
      ) {
        return false
      }
      if (
        filters.scent_family.length > 0 &&
        !filters.scent_family.some((s) => product.scent_family.includes(s))
      ) {
        return false
      }
      if (
        filters.intensity.length > 0 &&
        !filters.intensity.includes(product.intensity)
      ) {
        return false
      }
      if (
        filters.occasion.length > 0 &&
        !filters.occasion.some((o) => product.occasion.includes(o))
      ) {
        return false
      }
      return true
    })
  }, [products, filters])

  const handleProductPress = (product: Product) => {
    setSelectedProduct(product)
    setModalVisible(true)
  }

  const handleCloseModal = () => {
    setModalVisible(false)
    setSelectedProduct(null)
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        {/* Loading skeleton */}
        <ActivityIndicator size="large" color="#c9a84c" />
        <Text style={styles.loadingText}>Loading fragrances...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FilterBar filters={filters} onFiltersChange={setFilters} />

      {filteredProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyText}>No fragrances found</Text>
          <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ProductCard product={item} onPress={handleProductPress} />
          )}
        />
      )}

      <ProductModal
        product={selectedProduct}
        visible={modalVisible}
        onClose={handleCloseModal}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    color: '#888888',
    fontSize: 14,
    marginTop: 16,
    letterSpacing: 1,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 15,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubtext: {
    color: '#666666',
    fontSize: 14,
  },
})
