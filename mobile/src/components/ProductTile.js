import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../constants/theme';
import { formatCurrency } from '../utils/format';
import ProductThumbnail from './ProductThumbnail';
import QuantityStepper from './QuantityStepper';

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
  compact = false,
  onToggleFavorite,
  onAddToCart,
  onUpdateQty,
}) {
  const tag = product.tag ? TAG_CONFIG[product.tag] : null;
  const categoryMeta = getCategoryMeta(product.category);
  const deliveryLabel = product.deliveryWindow || 'Next delivery';
  const sourceLabel = [product.supplier, product.origin].filter(Boolean).join(' | ');
  const packLabel = product.packSize || `1 ${product.unit} pack`;
  const stockLabel =
    typeof product.stockLevel === 'number' ? `${product.stockLevel}+ in stock` : 'Freshly available';
  const compareAtPrice = Math.ceil(
    (Number(product.price) || 0) * (product.tag === 'premium' ? 1.12 : 1.18)
  );

  return (
    <View style={[styles.card, compact && styles.compactCard]}>
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

      <View style={[styles.mediaWrap, compact && styles.compactMediaWrap]}>
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

        <ProductThumbnail
          product={product}
          style={styles.imageFrame}
          imageStyle={[styles.productImage, compact && styles.compactProductImage]}
          iconSize={compact ? 26 : 30}
        />
      </View>

      <View style={styles.copyBlock}>
        <View style={styles.deliveryRow}>
          <View style={styles.deliveryPill}>
            <Text style={styles.deliveryText}>{deliveryLabel}</Text>
          </View>
          {product.isOrganic ? (
            <View style={styles.organicPill}>
              <Ionicons name="sparkles-outline" size={12} color={theme.colors.success} />
              <Text style={styles.organicText}>Organic</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.nameBlock}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          <Text numberOfLines={2} style={styles.packText}>
            {packLabel}
          </Text>
          {sourceLabel ? (
            <Text numberOfLines={2} style={styles.metaText}>
              {sourceLabel}
            </Text>
          ) : (
            <Text numberOfLines={2} style={styles.metaText}>
              {product.description}
            </Text>
          )}
        </View>

        <View style={styles.priceRow}>
          <View style={styles.pricePrimary}>
            <View style={styles.priceCopy}>
              <Text style={styles.price}>{formatCurrency(product.price)}</Text>
              <Text style={styles.unit}>/{product.unit}</Text>
            </View>
            <Text style={styles.comparePrice}>{formatCurrency(compareAtPrice)}</Text>
          </View>
          <View style={styles.stockPill}>
            <Text style={styles.stockText}>{stockLabel}</Text>
          </View>
        </View>
      </View>

      {cartQty === 0 ? (
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => onAddToCart(product)}
          activeOpacity={0.85}
        >
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
    borderRadius: 24,
    padding: 14,
    margin: 8,
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    position: 'relative',
    gap: 14,
    ...theme.shadows.card,
  },
  compactCard: {
    marginHorizontal: 6,
  },
  favBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 2,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.soft,
  },
  mediaWrap: {
    borderRadius: 22,
    backgroundColor: '#FBFAF4',
    padding: 12,
    gap: 12,
  },
  compactMediaWrap: {
    padding: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingRight: 42,
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
    paddingVertical: 5,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  imageFrame: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 176,
    borderRadius: 18,
    backgroundColor: '#F3F1E8',
  },
  compactProductImage: {
    height: 154,
  },
  copyBlock: {
    gap: 12,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
  },
  deliveryPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3F5EF',
    borderRadius: theme.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  deliveryText: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  organicPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: theme.colors.successSoft,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  organicText: {
    color: theme.colors.success,
    fontSize: 11,
    fontWeight: '800',
  },
  nameBlock: {
    gap: 5,
  },
  productName: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.colors.text,
    lineHeight: 23,
  },
  packText: {
    fontSize: 14,
    color: theme.colors.primaryDark,
    fontWeight: '700',
  },
  metaText: {
    fontSize: 13,
    color: theme.colors.muted,
    lineHeight: 19,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  pricePrimary: {
    gap: 4,
  },
  priceCopy: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  price: {
    fontSize: 19,
    fontWeight: '800',
    color: theme.colors.primaryDark,
  },
  comparePrice: {
    fontSize: 12,
    color: theme.colors.subtle,
    fontWeight: '700',
    textDecorationLine: 'line-through',
  },
  unit: {
    fontSize: 12,
    color: theme.colors.subtle,
  },
  stockPill: {
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  stockText: {
    color: theme.colors.primaryDark,
    fontSize: 12,
    fontWeight: '800',
  },
  addBtn: {
    backgroundColor: theme.colors.primaryDark,
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    ...theme.shadows.soft,
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
