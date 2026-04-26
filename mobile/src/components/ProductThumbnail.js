import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { theme } from '../constants/theme';
import { getFallbackProductImageUri, getProductImageUri } from '../utils/productImages';

const getCategoryMeta = (category) =>
  category === 'Fruit'
    ? {
        icon: 'nutrition-outline',
        color: theme.colors.fruitText,
        backgroundColor: theme.colors.fruitSoft,
      }
    : {
        icon: 'leaf-outline',
        color: theme.colors.primary,
        backgroundColor: theme.colors.primarySoft,
      };

export default function ProductThumbnail({
  product,
  style,
  imageStyle,
  iconSize = 28,
  resizeMode = 'cover',
}) {
  const categoryMeta = getCategoryMeta(product?.category);
  const primaryImageUri = getProductImageUri(product);
  const fallbackImageUri = getFallbackProductImageUri(product);
  const [imageUri, setImageUri] = useState(primaryImageUri);

  useEffect(() => {
    setImageUri(primaryImageUri);
  }, [primaryImageUri]);

  if (!imageUri) {
    return (
      <View
        style={[
          styles.placeholder,
          {
            backgroundColor: `${product?.color || categoryMeta.backgroundColor}18`,
            borderColor: `${product?.color || categoryMeta.color}25`,
          },
          style,
        ]}
      >
        <Ionicons
          name={categoryMeta.icon}
          size={iconSize}
          color={product?.color || categoryMeta.color}
        />
      </View>
    );
  }

  return (
    <View style={[styles.frame, style]}>
      <Image
        source={{ uri: imageUri }}
        style={[styles.image, imageStyle]}
        resizeMode={resizeMode}
        onError={() => {
          if (imageUri !== fallbackImageUri && fallbackImageUri) {
            setImageUri(fallbackImageUri);
            return;
          }

          setImageUri('');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
    backgroundColor: '#F6F1E8',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    backgroundColor: theme.colors.surfaceSoft,
  },
});
