import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import QuantityStepper from './QuantityStepper';
import { formatCurrency } from '../utils/format';

export default function ProductTile({
  product,
  isFavorite,
  cartQty,
  onToggleFavorite,
  onAddToCart,
  onUpdateQty,
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const productImageUri = product.imageUrl || product.image || null;

  useEffect(() => {
    setImageFailed(false);
  }, [productImageUri]);

  const handleAddPress = () => {
    onAddToCart(product);
  };

  const handleToggleFavoritePress = () => {
    onToggleFavorite(product);
  };

  return (
    <View style={styles.tile}>
      <Pressable onPress={handleToggleFavoritePress} style={styles.favoriteButton}>
        <Ionicons
          name={isFavorite ? 'heart' : 'heart-outline'}
          size={20}
          color={isFavorite ? theme.colors.danger : theme.colors.muted}
        />
      </Pressable>

      {productImageUri && !imageFailed ? (
        <Image
          source={{ uri: productImageUri }}
          style={styles.productImage}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons name="image-outline" size={40} color={theme.colors.muted} />
        </View>
      )}

      <View style={styles.details}>
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.productPrice}>{formatCurrency(product.price)} / {product.unit}</Text>

        {cartQty > 0 ? (
          <QuantityStepper
            value={cartQty}
            onDecrease={() => onUpdateQty(product._id, cartQty - 1)}
            onIncrease={() => onUpdateQty(product._id, cartQty + 1)}
          />
        ) : (
          <Pressable onPress={handleAddPress} style={styles.addButton}>
            <Ionicons name="add-outline" size={20} color={theme.colors.white} />
            <Text style={styles.addButtonText}>Add</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    margin: 6,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
    padding: 4,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: theme.radius.sm,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: 120,
    borderRadius: theme.radius.sm,
    marginBottom: 10,
    backgroundColor: theme.colors.surfaceAccent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  details: {
    width: '100%',
    gap: 6,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  productPrice: {
    fontSize: 14,
    color: theme.colors.primaryDark,
    fontWeight: '600',
    marginBottom: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.sm,
    paddingVertical: 8,
    gap: 4,
  },
  addButtonText: {
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
});
