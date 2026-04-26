import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useEffect, useState } from 'react';
import { theme } from '../constants/theme';
import QuantityStepper from './QuantityStepper';
import { formatCurrency } from '../utils/format';
import { getFallbackProductImageUri, getProductImageUri } from '../utils/productImages';

const TAG_CONFIG = {
  bestseller: { label: 'Bestseller', backgroundColor: '#FFF3E0', color: '#C56711' },
  organic: { label: 'Organic', backgroundColor: '#E8F5E9', color: '#2E7D32' },
  seasonal: { label: 'Seasonal', backgroundColor: '#E7F0FD', color: '#245A9A' },
  new: { label: 'New', backgroundColor: '#FCEFF3', color: '#A23662' },
  premium: { label: 'Premium', backgroundColor: '#EFE8FF', color: '#6A49AA' },
};

const getCategoryMeta = (category) =>
  category === 'Fruit'
    ? {
        icon: 'nutrition-outline',
        label: 'Fruit',
        backgroundColor: theme.colors.fruitSoft,
        color: theme.colors.fruitText,
      }
    : {
        icon: 'leaf-outline',
        label: 'Vegetable',
        backgroundColor: theme.colors.primarySoft,
        color: theme.colors.primary,
      };

export default function ProductTile({
  product,
  isFavorite,
  cartQty,
  onToggleFavorite,
  onAddToCart,
  onUpdateQty,
}) {
  const tag = product.tag ? TAG_CONFIG[product.tag] : null;
  const categoryMeta = getCategoryMeta(product.category);
  const primaryImageUri = getProductImageUri(product);
  const fallbackImageUri = getFallbackProductImageUri(product);
  const [imageUri, setImageUri] = useState(primaryImageUri);

  useEffect(() => {
    setImageUri(primaryImageUri);
  }, [primaryImageUri]);

  return (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={() => onToggleFavorite(product)}
        style={styles.favBtn}
        activeOpacity={0.8}
      >
        <Ionicons
          name={isFavorite ? 'heart' : 'heart-outline'}
          size={18}
          color={isFavorite ? theme.colors.danger : theme.colors.muted}
        />
      </TouchableOpacity>

      <View style={styles.topRow}>
        <View style={[styles.categoryChip, { backgroundColor: categoryMeta.backgroundColor }]}>
          <Ionicons name={categoryMeta.icon} size={14} color={categoryMeta.color} />
          <Text style={[styles.categoryChipText, { color: categoryMeta.color }]}>
            {categoryMeta.label}
          </Text>
        </View>
        {tag ? (
          <View style={[styles.tagChip, { backgroundColor: tag.backgroundColor }]}>
            <Text style={[styles.tagText, { color: tag.color }]}>{tag.label}</Text>
          </View>
        ) : null}
      </View>

      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={styles.productImage}
          onError={() => {
            if (imageUri !== fallbackImageUri && fallbackImageUri) {
              setImageUri(fallbackImageUri);
              return;
            }

            setImageUri('');
          }}
        />
      ) : (
        <View
          style={[
            styles.iconCircle,
            {
              backgroundColor: `${product.color || theme.colors.primary}22`,
              borderColor: `${product.color || theme.colors.primary}44`,
            },
          ]}
        >
          <Ionicons
            name={categoryMeta.icon}
            size={30}
            color={product.color || categoryMeta.color}
          />
        </View>
      )}

      <Text style={styles.productName}>{product.name}</Text>
      <Text numberOfLines={2} style={styles.productDesc}>
        {product.description}
      </Text>

      <View style={styles.priceRow}>
        <Text style={styles.price}>{formatCurrency(product.price)}</Text>
        <Text style={styles.unit}>/{product.unit}</Text>
      </View>

      {cartQty === 0 ? (
        <TouchableOpacity style={styles.addBtn} onPress={() => onAddToCart(product)} activeOpacity={0.85}>
          <Ionicons name="add-circle-outline" size={18} color={theme.colors.white} />
          <Text style={styles.addBtnText}>Add to cart</Text>
        </TouchableOpacity>
      ) : (
        <QuantityStepper
          value={cartQty}
          onDecrease={() => onUpdateQty(product._id, cartQty - 1)}
          onIncrease={() => onUpdateQty(product._id, cartQty + 1)}
          style={styles.qtyRow}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: 16,
    margin: 6,
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    position: 'relative',
    gap: 10,
    ...theme.shadows.card,
  },
  favBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  topRow: {
    gap: 8,
    paddingRight: 38,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  tagChip: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    borderWidth: 2,
  },
  productImage: {
    width: '100%',
    height: 148,
    borderRadius: 18,
    resizeMode: 'cover',
    backgroundColor: '#F7F3EB',
  },
  productName: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text,
  },
  productDesc: {
    fontSize: 13,
    color: theme.colors.muted,
    lineHeight: 19,
    minHeight: 38,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  price: {
    fontSize: 19,
    fontWeight: '800',
    color: theme.colors.primaryDark,
  },
  unit: {
    fontSize: 12,
    color: theme.colors.subtle,
  },
  addBtn: {
    backgroundColor: theme.colors.cta,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  addBtnText: {
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  qtyRow: {
    marginTop: 2,
  },
});
