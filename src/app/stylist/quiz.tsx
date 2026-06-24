import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Ionicons } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { Txt } from '@/components/ui/text';
import { palette, Radius, Spacing } from '@/constants/theme';
import type { StyleProfile } from '@/lib/types';
import { useCloset } from '@/store/closet';

type Step =
  | { kind: 'intro' }
  | { kind: 'single'; key: keyof StyleProfile; q: string; options: string[] }
  | { kind: 'multi'; key: keyof StyleProfile; q: string; options: string[] }
  | { kind: 'measure'; q: string };

const STEPS: Step[] = [
  { kind: 'intro' },
  { kind: 'single', key: 'gender', q: 'What is your gender?', options: ['Female', 'Male', 'Non-binary', 'Rather not say'] },
  { kind: 'single', key: 'country', q: 'Where do you live?', options: ['New Zealand', 'Australia', 'United States', 'United Kingdom', 'Canada', 'Other'] },
  { kind: 'single', key: 'lifestyle', q: 'What is your primary lifestyle and work type?', options: ['Middle/High school student', 'University student', 'Casual attire worker', 'Formal attire worker', 'Uniformed worker', 'Homemaker', 'Other'] },
  { kind: 'single', key: 'hairColor', q: 'What is your hair color?', options: ['Blonde', 'Brunette', 'Dark brown/Black', 'Redhead', 'Gray/Silver', 'Other', 'I am not sure'] },
  { kind: 'single', key: 'eyeColor', q: 'What is your eye color?', options: ['Brown', 'Black', 'Blue', 'Hazel', 'Green', 'Gray', 'Other', 'I am not sure'] },
  { kind: 'single', key: 'colorSeason', q: 'Which colors suit you best?', options: ['I am not sure', 'Warm · Bright', 'Cool · Soft', 'Warm · Deep', 'Cool · Bright', 'Warm · Light', 'Cool · Deep'] },
  { kind: 'single', key: 'bodyType', q: 'What is your body type?', options: ['I am not sure', 'Triangle', 'Inverted Triangle', 'Rectangle', 'Round', 'Hourglass'] },
  { kind: 'measure', q: 'What are your height and weight?' },
  { kind: 'multi', key: 'goToStyles', q: 'Pick your go-to styles', options: ['Casual', 'Minimal', 'Streetwear', 'Sporty / Athleisure', 'Classic', 'Elegant', 'Boho', 'Y2K'] },
  { kind: 'single', key: 'priceRange', q: 'Which price range of brands do you usually prefer?', options: ['Affordable brands', 'Mid-range brands', 'Premium brands', 'Luxury brands', 'I am not sure'] },
];

export default function StyleQuizScreen() {
  const router = useRouter();
  const existing = useCloset((s) => s.settings.styleProfile);
  const setSettings = useCloset((s) => s.setSettings);

  const [i, setI] = useState(0);
  const [profile, setProfile] = useState<StyleProfile>(existing ?? {});
  const [height, setHeight] = useState(existing?.heightCm ? String(existing.heightCm) : '');
  const [weight, setWeight] = useState(existing?.weightKg ? String(existing.weightKg) : '');

  const step = STEPS[i];
  const total = STEPS.length;

  const back = () => (i === 0 ? router.back() : setI(i - 1));

  const finish = () => {
    setSettings({
      styleProfile: {
        ...profile,
        heightCm: height ? Number(height) || undefined : profile.heightCm,
        weightKg: weight ? Number(weight) || undefined : profile.weightKg,
        completedAt: new Date().toISOString(),
      },
    });
    router.replace('/stylist/chat');
  };

  const next = () => (i >= total - 1 ? finish() : setI(i + 1));

  // Can we advance? (intro + measurements are always skippable)
  const answered =
    step.kind === 'intro' ||
    step.kind === 'measure' ||
    (step.kind === 'single' && !!profile[step.key]) ||
    (step.kind === 'multi' && ((profile[step.key] as string[] | undefined)?.length ?? 0) > 0);

  const pickSingle = (key: keyof StyleProfile, v: string) =>
    setProfile((p) => ({ ...p, [key]: v }));
  const toggleMulti = (key: keyof StyleProfile, v: string) =>
    setProfile((p) => {
      const cur = (p[key] as string[] | undefined) ?? [];
      return { ...p, [key]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] };
    });

  return (
    <Screen scroll={false} bottomInset={false} header={<Header onBack={back} step={i} total={total} />}>
      <Stack.Screen options={{ headerShown: false }} />

      {step.kind === 'intro' ? (
        <View style={styles.intro}>
          <Txt variant="h1" style={{ textAlign: 'center' }}>Help your stylist find your perfect look!</Txt>
          <Txt style={{ fontSize: 80, marginVertical: Spacing.xxl }}>🐱</Txt>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
          <Txt variant="h1" style={{ marginBottom: Spacing.xl }}>{step.q}</Txt>

          {step.kind === 'single'
            ? step.options.map((o) => {
                const on = profile[step.key] === o;
                return (
                  <Pressable key={o} style={styles.optRow} onPress={() => pickSingle(step.key, o)}>
                    <Txt variant="body" style={{ flex: 1, color: on ? palette.blue : palette.ink }}>{o}</Txt>
                    <Ionicons name={on ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={on ? palette.blue : palette.silver} />
                  </Pressable>
                );
              })
            : null}

          {step.kind === 'multi'
            ? step.options.map((o) => {
                const on = ((profile[step.key] as string[] | undefined) ?? []).includes(o);
                return (
                  <Pressable key={o} style={styles.optRow} onPress={() => toggleMulti(step.key, o)}>
                    <Txt variant="body" style={{ flex: 1, color: on ? palette.blue : palette.ink }}>{o}</Txt>
                    <Ionicons name={on ? 'checkbox' : 'square-outline'} size={22} color={on ? palette.blue : palette.silver} />
                  </Pressable>
                );
              })
            : null}

          {step.kind === 'measure' ? (
            <View style={{ gap: Spacing.lg }}>
              <View>
                <Txt variant="label" color="textSecondary" style={{ marginBottom: 8 }}>Height (cm)</Txt>
                <Input placeholder="Height" value={height} onChangeText={(t) => setHeight(t.replace(/[^0-9]/g, ''))} keyboardType="number-pad" inputMode="numeric" />
              </View>
              <View>
                <Txt variant="label" color="textSecondary" style={{ marginBottom: 8 }}>Weight (kg, optional)</Txt>
                <Input placeholder="Weight" value={weight} onChangeText={(t) => setWeight(t.replace(/[^0-9]/g, ''))} keyboardType="number-pad" inputMode="numeric" />
              </View>
              <Txt variant="caption" color="textMuted">Entering your weight helps suggest better fits. We keep this private.</Txt>
            </View>
          ) : null}
        </ScrollView>
      )}

      <View style={styles.footer}>
        <Button
          title={step.kind === 'intro' ? "I'm ready" : i >= total - 1 ? 'Finish' : 'Next'}
          onPress={next}
          disabled={!answered}
        />
        {step.kind === 'measure' ? (
          <Pressable onPress={next} style={{ alignItems: 'center', paddingVertical: Spacing.md }}>
            <Txt variant="small" color="textMuted">Fill in later</Txt>
          </Pressable>
        ) : null}
      </View>
    </Screen>
  );
}

function Header({ onBack, step, total }: { onBack: () => void; step: number; total: number }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} hitSlop={8} style={{ paddingVertical: 6 }}>
        <Ionicons name="chevron-back" size={26} color={palette.ink} />
      </Pressable>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${((step + 1) / total) * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  progressTrack: { flex: 1, height: 4, borderRadius: 2, backgroundColor: palette.mist, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: palette.ink, borderRadius: 2 },
  intro: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.lg },
  optRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: palette.hairline },
  footer: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: Spacing.xl },
});
