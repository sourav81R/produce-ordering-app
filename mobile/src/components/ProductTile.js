import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../constants/theme';

const TAG_CONFIG = {
  bestseller: { label: '⭐ Bestseller', backgroundColor: '#FFF3E0', color: '#E65100' },
  organic: { label: '🌱 Organic', backgroundColor: '#E8F5E9', color: '#2E7D32' },
  seasonal: { label: '🍂 Seasonal', backgroundColor: '#E3F2FD', color: '#1565C0' },
  new: { label: '✨ New', backgroundColor: '#FCE4EC', color: '#880E4F' },
  premium: { label: '💎 Premium', backgroundColor: '#EDE7F6', color: '#4527A0' },
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

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => onToggleFavorite(product)} style={styles.favBtn} activeOpacity={0.75}>
        <Text style={styles.favText}>{isFavorite ? '❤️' : '🤍'}</Text>
      </TouchableOpacity>

      {tag ? (
        <View style={[styles.tagChip, { backgroundColor: tag.backgroundColor }]}>
          <Text style={[styles.tagText, { color: tag.color }]}>{tag.label}</Text>
        </View>
      ) : null}

      <View
        style={[
          styles.emojiCircle,
          {
            backgroundColor: `${product.color}22`,
            borderColor: `${product.color}44`,
          },
        ]}
      >
        <Text style={styles.emoji}>{product.emoji}</Text>
      </View>

      <Text style={styles.productName}>{product.name}</Text>
      <Text numberOfLines={2} style={styles.productDesc}>
        {product.description}
      </Text>

      <View style={styles.priceRow}>
        <Text style={styles.price}>{`₹${product.price}`}</Text>
        <Text style={styles.unit}>/{product.unit}</Text>
      </View>

      {cartQty === 0 ? (
        <TouchableOpacity style={styles.addBtn} onPress={() => onAddToCart(product)} activeOpacity={0.75}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.qtyRow}>
          <TouchableOpacity
            style={styles.qtyBtnLight}
            onPress={() => onUpdateQty(product._id, cartQty - 1)}
            activeOpacity={0.75}
          >
            <Text style={styles.qtyBtnLightText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.qtyNum}>{cartQty}</Text>
          <TouchableOpacity
            style={styles.qtyBtnDark}
            onPress={() => onUpdateQty(product._id, cartQty + 1)}
            activeOpacity={0.75}
          >
            <Text style={styles.qtyBtnDarkText}>+</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    margin: 6,
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E8F5E9',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    position: 'relative',
    overflow: 'hidden',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  favText: {
    fontSize: 18,
  },
  tagChip: {
    position: 'absolute',
    top: 12,
    left: 12,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 1,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  emojiCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 12,
    marginTop: 10,
    borderWidth: 2,
  },
  emoji: {
    fontSize: 36,
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  productDesc: {
    fontSize: 12,
    color: '#777777',
    lineHeight: 17,
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  price: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2E7D32',
  },
  unit: {
    fontSize: 12,
    color: '#999999',
    marginLeft: 2,
  },
  addBtn: {
    backgroundColor: '#FF6F00',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F1F8F2',
    borderRadius: 12,
    padding: 6,
    borderWidth: 1,
    borderColor: '#D7EAD9',
  },
  qtyBtnLight: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D7EAD9',
  },
  qtyBtnLightText: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  qtyBtnDark: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
  },
  qtyBtnDarkText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  qtyNum: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.primaryDark,
  },
});
