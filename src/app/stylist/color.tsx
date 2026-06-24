import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { BackTitle } from '@/components/sub-header';
import { TopBar } from '@/components/top-bar';
import { Button } from '@/components/ui/button';
import { Ionicons } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { Txt } from '@/components/ui/text';
import { palette, Radius, Spacing } from '@/constants/theme';

type Warmth = 'warm' | 'cool' | 'neutral';
type Depth = 'deep' | 'light';
type Opt = { label: string; warmth?: Warmth; depth?: Depth };

const QUESTIONS: { q: string; options: Opt[] }[] = [
  {
    q: 'The veins on your wrist look…',
    options: [
      { label: 'Greenish', warmth: 'warm' },
      { label: 'Blue or purple', warmth: 'cool' },
      { label: 'A mix of both', warmth: 'neutral' },
    ],
  },
  {
    q: 'Which jewellery flatters you most?',
    options: [
      { label: 'Gold', warmth: 'warm' },
      { label: 'Silver', warmth: 'cool' },
      { label: 'Both look good', warmth: 'neutral' },
    ],
  },
  {
    q: 'Your natural colouring is…',
    options: [
      { label: 'High-contrast & striking', depth: 'deep' },
      { label: 'Soft & blended', depth: 'light' },
    ],
  },
];

const SEASONS = {
  Spring: {
    name: 'Spring Bright',
    tagline: 'Vivid, fresh, and full of life',
    traits:
      'You look your best in clear, warm, high-energy colours that mirror your natural glow. Lean into vibrant shades with warmth and clarity.',
    colors: ['#FF7A5C', '#5BD3D6', '#FFB27A', '#F6D45C', '#9BD45C'],
    neutrals: 'Warm ivory, light camel, soft gold.',
  },
  Summer: {
    name: 'Soft Summer',
    tagline: 'Cool, soft, and elegant',
    traits:
      'Muted, cool tones suit you best. Think dusty, blended shades rather than anything too bright or stark.',
    colors: ['#C9A7B5', '#A8C3D6', '#C7BCE0', '#A7C4A0', '#C2C7CE'],
    neutrals: 'Soft grey, taupe, cool navy.',
  },
  Autumn: {
    name: 'Deep Autumn',
    tagline: 'Warm, rich, and earthy',
    traits:
      'Warm, deep, earthy shades bring out your richness. Spice and forest tones beat icy or pastel colours.',
    colors: ['#B5562E', '#7A7A3A', '#D79A3C', '#C2603E', '#3F5E3A'],
    neutrals: 'Chocolate, olive, cream.',
  },
  Winter: {
    name: 'Cool Winter',
    tagline: 'Bold, crisp, and striking',
    traits:
      'Clear, cool, high-contrast colours make you pop. Go for jewel tones and true brights over muted or warm shades.',
    colors: ['#D7263D', '#2E5BFF', '#1FA37A', '#D6489B', '#16181C'],
    neutrals: 'Pure white, charcoal, black.',
  },
} as const;

function decide(warmth: Warmth, depth: Depth): keyof typeof SEASONS {
  if (warmth === 'warm') return depth === 'deep' ? 'Autumn' : 'Spring';
  if (warmth === 'cool') return depth === 'deep' ? 'Winter' : 'Summer';
  return depth === 'deep' ? 'Winter' : 'Spring';
}

export default function ColorScreen() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Opt[]>([]);
  const [result, setResult] = useState<keyof typeof SEASONS | null>(null);

  const pick = (opt: Opt) => {
    const next = [...answers, opt];
    setAnswers(next);
    if (next.length >= QUESTIONS.length) {
      const warm = next.filter((o) => o.warmth === 'warm').length;
      const cool = next.filter((o) => o.warmth === 'cool').length;
      const warmth: Warmth = warm > cool ? 'warm' : cool > warm ? 'cool' : 'neutral';
      const depth: Depth = next.find((o) => o.depth)?.depth ?? 'light';
      setResult(decide(warmth, depth));
    }
  };

  const retake = () => {
    setAnswers([]);
    setResult(null);
  };

  const header = <TopBar left={<BackTitle title="Find my colour" onBack={() => router.back()} />} />;

  if (result) {
    const s = SEASONS[result];
    return (
      <Screen header={header}>
        <View style={{ alignItems: 'center', gap: 4, marginTop: Spacing.lg }}>
          <Txt variant="h1" style={{ textAlign: 'center' }}>{s.name}</Txt>
          <Txt color="textSecondary" style={{ textAlign: 'center' }}>{s.tagline}</Txt>
        </View>

        <Txt variant="title" style={{ marginTop: Spacing.xl }}>Key traits</Txt>
        <Txt color="textSecondary" style={{ marginTop: 6 }}>{s.traits}</Txt>

        <Txt variant="title" style={{ marginTop: Spacing.xl }}>Best colours</Txt>
        <View style={styles.swatches}>
          {s.colors.map((c) => (
            <View key={c} style={[styles.swatch, { backgroundColor: c }]} />
          ))}
        </View>
        <Txt variant="small" color="textMuted" style={{ marginTop: Spacing.md }}>
          Neutrals: {s.neutrals}
        </Txt>

        <Button title="Retake quiz" variant="secondary" onPress={retake} style={{ marginTop: Spacing.xxl }} />
      </Screen>
    );
  }

  const current = QUESTIONS[answers.length];
  return (
    <Screen header={header}>
      <Txt variant="small" color="textMuted">
        Question {answers.length + 1} of {QUESTIONS.length}
      </Txt>
      <View style={styles.progress}>
        {QUESTIONS.map((_, i) => (
          <View key={i} style={[styles.dot, i <= answers.length ? styles.dotOn : null]} />
        ))}
      </View>

      <Txt variant="h2" style={{ marginTop: Spacing.lg }}>{current.q}</Txt>

      <View style={{ gap: Spacing.md, marginTop: Spacing.xl }}>
        {current.options.map((opt) => (
          <Pressable
            key={opt.label}
            onPress={() => pick(opt)}
            style={({ pressed }) => [styles.option, pressed ? { opacity: 0.7 } : null]}>
            <Txt variant="bodyStrong">{opt.label}</Txt>
            <Ionicons name="chevron-forward" size={18} color={palette.gray} />
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  progress: { flexDirection: 'row', gap: 6, marginTop: 8 },
  dot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: palette.mist },
  dotOn: { backgroundColor: palette.ink },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: palette.hairline,
    borderRadius: Radius.lg,
    paddingVertical: 18,
    paddingHorizontal: Spacing.lg,
  },
  swatches: { flexDirection: 'row', gap: 10, marginTop: Spacing.md },
  swatch: { flex: 1, height: 56, borderRadius: Radius.md, borderWidth: 1, borderColor: palette.hairline },
});
