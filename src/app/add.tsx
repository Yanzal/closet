import { Image } from 'expo-image';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';

import { PlaceholderThumb } from '@/components/placeholder-thumb';
import { beautifyToFlatImage } from '@/lib/ai/native';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Ionicons } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { Txt } from '@/components/ui/text';
import { TopBar } from '@/components/top-bar';
import { palette, Radius, Spacing } from '@/constants/theme';
import { CATEGORIES, COLOR_OPTIONS, colorHex, SEASONS } from '@/lib/categories';
import type { Category, Season } from '@/lib/types';
import { useCloset } from '@/store/closet';

/** Resize + compress a picked image into a small JPEG data URL (persists on web + native). */
async function toStoredImage(uri: string, fallbackBase64?: string | null): Promise<string> {
  try {
    const out = await manipulateAsync(uri, [{ resize: { width: 1000 } }], {
      compress: 0.6,
      format: SaveFormat.JPEG,
      base64: true,
    });
    const stored = out.base64 ? `data:image/jpeg;base64,${out.base64}` : out.uri;
    // On a real iOS build with Apple Intelligence this cleans up the photo; elsewhere it's a no-op.
    return await beautifyToFlatImage(stored);
  } catch {
    return fallbackBase64 ? `data:image/jpeg;base64,${fallbackBase64}` : uri;
  }
}

export default function AddScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ wishlist?: string }>();
  const addItem = useCloset((s) => s.addItem);

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('Tops');
  const [brand, setBrand] = useState('');
  const [colors, setColors] = useState<string[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [price, setPrice] = useState('');
  const wishlist = params.wishlist === '1';

  const toggleColor = (c: string) =>
    setColors((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));
  const toggleSeason = (s: Season) =>
    setSeasons((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  const pick = async (useCamera: boolean) => {
    try {
      if (useCamera) {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Camera access needed', 'Enable camera access to take a photo.');
          return;
        }
      }
      const opts: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
        base64: true,
      };
      const res = useCamera
        ? await ImagePicker.launchCameraAsync(opts)
        : await ImagePicker.launchImageLibraryAsync(opts);
      if (res.canceled || !res.assets?.length) return;
      setProcessing(true);
      const asset = res.assets[0];
      const stored = await toStoredImage(asset.uri, asset.base64);
      setPhotoUri(stored);
    } catch (e) {
      Alert.alert('Could not load image', String(e));
    } finally {
      setProcessing(false);
    }
  };

  const onSave = () => {
    const finalName = name.trim() || (colors[0] ? `${colors[0]} ${category}` : category);
    addItem({
      name: finalName,
      photoUri: photoUri ?? '',
      category,
      brand: brand.trim() || undefined,
      colors,
      seasons,
      price: price ? Number(price) || undefined : undefined,
      wishlist: wishlist || undefined,
    });
    router.replace('/added');
  };

  const header = (
    <TopBar
      left={
        <IconButton onPress={() => router.back()} style={{ marginLeft: -8 }}>
          <Ionicons name="close" size={26} color={palette.ink} />
        </IconButton>
      }
      right={
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          {!wishlist ? (
            <IconButton onPress={() => router.replace('/add-batch')}>
              <Ionicons name="copy-outline" size={22} color={palette.ink} />
            </IconButton>
          ) : null}
          <Button title="Save" compact full={false} disabled={processing} onPress={onSave} />
        </View>
      }
    />
  );

  return (
    <Screen header={header} bottomInset={false}>
      <Stack.Screen options={{ presentation: 'modal', headerShown: false, animation: 'slide_from_bottom' }} />

      <Txt variant="h2">{wishlist ? 'Add to wishlist' : 'Add item'}</Txt>
      <Txt variant="small" color="textMuted" style={{ marginTop: 4 }}>
        Snap or upload a photo, then tag it. We&apos;ll clean up the background automatically.
      </Txt>

      {/* Photo area */}
      <View style={styles.photoBox}>
        {processing ? (
          <ActivityIndicator color={palette.ink} />
        ) : photoUri ? (
          <>
            <Image source={{ uri: photoUri }} style={styles.photo} contentFit="cover" />
            <Pressable style={styles.changeBtn} onPress={() => pick(false)}>
              <Ionicons name="image-outline" size={16} color="#fff" />
              <Txt variant="caption" color="onPrimary">Change</Txt>
            </Pressable>
          </>
        ) : (
          <View style={styles.photoEmpty}>
            <Ionicons name="camera-outline" size={30} color={palette.gray} />
            <Txt variant="small" color="textMuted">Add a photo of your item</Txt>
            <View style={styles.photoButtons}>
              <Button
                title="Camera"
                compact
                full={false}
                leftIcon={<Ionicons name="camera" size={16} color="#fff" />}
                onPress={() => pick(true)}
              />
              <Button
                title="Upload"
                compact
                full={false}
                variant="ghost"
                leftIcon={<Ionicons name="images-outline" size={16} color={palette.ink} />}
                onPress={() => pick(false)}
              />
            </View>
          </View>
        )}
      </View>

      <Field label="Name">
        <Input placeholder="e.g. White cotton tee" value={name} onChangeText={setName} />
      </Field>

      <Field label="Category">
        <View style={styles.wrap}>
          {CATEGORIES.map((c) => (
            <Chip
              key={c.key}
              label={c.label}
              selected={category === c.key}
              onPress={() => setCategory(c.key)}
            />
          ))}
        </View>
      </Field>

      <Field label="Brand">
        <Input placeholder="e.g. Uniqlo" value={brand} onChangeText={setBrand} autoCapitalize="words" />
      </Field>

      <Field label="Colors">
        <View style={styles.wrap}>
          {COLOR_OPTIONS.map((c) => (
            <Chip
              key={c.name}
              label={c.name}
              selected={colors.includes(c.name)}
              onPress={() => toggleColor(c.name)}
              leading={<View style={[styles.swatch, { backgroundColor: colorHex(c.name) }]} />}
            />
          ))}
        </View>
      </Field>

      <Field label="Season">
        <View style={styles.wrap}>
          {SEASONS.map((s) => (
            <Chip key={s} label={s} selected={seasons.includes(s)} onPress={() => toggleSeason(s)} />
          ))}
        </View>
      </Field>

      <Field label="Price">
        <Input
          placeholder="0"
          value={price}
          onChangeText={(t) => setPrice(t.replace(/[^0-9.]/g, ''))}
          keyboardType="decimal-pad"
          inputMode="decimal"
        />
      </Field>

      <Button title={wishlist ? 'Save to wishlist' : 'Save to closet'} onPress={onSave} disabled={processing} style={{ marginTop: Spacing.xxl }} />
    </Screen>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 8, marginTop: Spacing.lg }}>
      <Txt variant="label" color="textSecondary">
        {label}
      </Txt>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  photoBox: {
    marginTop: Spacing.lg,
    aspectRatio: 1,
    borderRadius: Radius.xl,
    backgroundColor: palette.cloud,
    borderWidth: 1,
    borderColor: palette.hairline,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photo: { width: '100%', height: '100%' },
  photoEmpty: { alignItems: 'center', gap: 10, padding: Spacing.lg },
  photoButtons: { flexDirection: 'row', gap: Spacing.sm, marginTop: 6 },
  changeBtn: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(18,19,22,0.78)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.pill,
  },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  swatch: { width: 12, height: 12, borderRadius: 6, borderWidth: 1, borderColor: palette.hairline },
});
