import React, { useEffect, useState, useMemo } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  TextInput,
  TouchableOpacity,
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
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<ActiveFilters>({
    season: [],
    scent_family: [],
    intensity: [],
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
      // Search check
      if (
        searchQuery.trim() !== '' &&
        !product.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false
      }

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
      return true
    })
  }, [products, filters, searchQuery])

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
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name..."
            placeholderTextColor="#666666"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchX}>
              <Text style={styles.clearSearchXText}>✕</Text>
            </TouchableOpacity>
          )}
        </div>
      </View>

      <FilterBar 
        filters={filters} 
        onFiltersChange={setFilters} 
        onClear={() => setSearchQuery('')}
      />

      {filteredProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyText}>No fragrances found</Text>
          <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
          <TouchableOpacity 
            style={styles.emptyClearButton} 
            onPress={() => {
              setSearchQuery('')
              setFilters({ season: [], scent_family: [], intensity: [] })
            }}
          >
            <Text style={styles.emptyClearButtonText}>Clear all filters</Text>
          </TouchableOpacity>
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
  emptyClearButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: 'rgba(201,168,76,0.15)',
    borderWidth: 1,
    borderColor: '#c9a84c',
  },
  emptyClearButtonText: {
    color: '#c9a84c',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 15,
  },
  clearSearchX: {
    padding: 4,
  },
  clearSearchXText: {
    color: '#888888',
    fontSize: 16,
  },
})
