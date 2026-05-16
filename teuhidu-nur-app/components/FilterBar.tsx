import React from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { ScentFamily, Season, Intensity } from '../types'

interface FilterOption {
  label: string
  value: string
}

interface FilterCategory {
  key: string
  label: string
  options: FilterOption[]
}

const FILTER_CATEGORIES: FilterCategory[] = [
  {
    key: 'season',
    label: 'Season',
    options: [
      { label: 'Spring', value: 'spring' },
      { label: 'Summer', value: 'summer' },
      { label: 'Autumn', value: 'autumn' },
      { label: 'Winter', value: 'winter' },
    ],
  },
  {
    key: 'scent_family',
    label: 'Scent',
    options: [
      { label: 'Oud', value: 'oud' },
      { label: 'Floral', value: 'floral' },
      { label: 'Woody', value: 'woody' },
      { label: 'Fresh', value: 'fresh' },
      { label: 'Oriental', value: 'oriental' },
      { label: 'Citrus', value: 'citrus' },
      { label: 'Musky', value: 'musky' },
    ],
  },
  {
    key: 'intensity',
    label: 'Intensity',
    options: [
      { label: 'Light', value: 'light' },
      { label: 'Moderate', value: 'moderate' },
      { label: 'Strong', value: 'strong' },
    ],
  },
  },
]

export interface ActiveFilters {
  season: Season[]
  scent_family: ScentFamily[]
  intensity: Intensity[]
}

interface FilterBarProps {
  filters: ActiveFilters
  onFiltersChange: (filters: ActiveFilters) => void
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onFiltersChange }) => {
  const hasActiveFilters = Object.values(filters).some((arr) => arr.length > 0)

  const toggleFilter = (category: string, value: string) => {
    const key = category as keyof ActiveFilters
    const current = filters[key] as string[]
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    onFiltersChange({ ...filters, [key]: updated })
  }

  const clearAll = () => {
    onFiltersChange({
      season: [],
      scent_family: [],
      intensity: [],
    })
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {hasActiveFilters && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearAll}
            activeOpacity={0.7}
          >
            <Text style={styles.clearButtonText}>✕ Clear</Text>
          </TouchableOpacity>
        )}

        {FILTER_CATEGORIES.map((category) => (
          <React.Fragment key={category.key}>
            <View style={styles.categoryLabel}>
              <Text style={styles.categoryLabelText}>{category.label}</Text>
            </View>
            {category.options.map((option) => {
              const isActive = (
                filters[category.key as keyof ActiveFilters] as string[]
              ).includes(option.value)
              return (
                <TouchableOpacity
                  key={`${category.key}-${option.value}`}
                  style={[styles.chip, isActive && styles.chipActive]}
                  onPress={() => toggleFilter(category.key, option.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.chipText, isActive && styles.chipTextActive]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </React.Fragment>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
  },
  clearButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  clearButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  categoryLabel: {
    marginLeft: 8,
    marginRight: 2,
  },
  categoryLabelText: {
    color: '#666666',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  chipActive: {
    backgroundColor: '#c9a84c',
    borderColor: '#c9a84c',
  },
  chipText: {
    color: '#999999',
    fontSize: 13,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#000000',
    fontWeight: '700',
  },
})
