import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, LayoutChangeEvent, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { OutfitPreview } from '@/components/outfit/outfit-preview';
import { BackTitle } from '@/components/sub-header';
import { TopBar } from '@/components/top-bar';
import { Chip } from '@/components/ui/chip';
import { Ionicons } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { Txt } from '@/components/ui/text';
import { palette, Radius, Spacing } from '@/constants/theme';
import { generateConfigured } from '@/lib/ai/config';
import { appleIntelligenceAvailable } from '@/lib/ai/native';
import { remoteGenerate } from '@/lib/ai/remote';
import { buildLookNodes, suggestOutfit, suggestOutfitSmart, type Warmth } from '@/lib/ai/stylist';
import { addDaysKey, fmtDayShort, todayKey } from '@/lib/date';
import { isOwned } from '@/lib/owned';
import type { ClothingItem, PlacedNode } from '@/lib/types';
import { DayWeather, geocodeCity, getDailyForecast, weatherInfo } from '@/lib/weather';
import { useCloset } from '@/store/closet';

const ENOUGH = 10;

interface Msg {
  id: string;
  role: 'user' | 'stylist';
  text: string;
  nodes?: PlacedNode[];
  meta?: string;
}

function warmthFromWeather(w: DayWeather | null): Warmth {
  if (!w) return 'mild';
  if (w.tMax <= 12) return 'cold';
  if (w.tMax >= 23) return 'warm';
  return 'mild';
}

const TITLES = ['Casual & Trendy', 'Effortless Everyday', 'Smart & Polished', 'Cosy Layers', 'Clean & Minimal'];

const OCCASION_TAGS = ['Daily', 'School', 'Work', 'Travel', 'Party', 'Date'];
const STYLE_TAGS = ['Casual', 'Classic', 'Street', 'Modern', 'Minimal'];

export default function StylistChatScreen() {
  const router = useRouter();
  const items = useCloset((s) => s.items);
  const homeCity = useCloset((s) => s.settings.homeCity);
  const tempUnit = useCloset((s) => s.settings.tempUnit);

  const owned = items.filter(isOwned);
  const tomorrow = addDaysKey(todayKey(), 1);

  const [weather, setWeather] = useState<DayWeather | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState('');
  const [thinking, setThinking] = useState(false);
  const [w, setW] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  // Outfit Inspiration: curated-feeling looks the user can browse by occasion / style.
  const [inspOcc, setInspOcc] = useState(OCCASION_TAGS[0]);
  const [inspStyle, setInspStyle] = useState(STYLE_TAGS[0]);
  const inspLooks = useMemo(() => {
    if (owned.length < 2) return [] as PlacedNode[][];
    const warm = warmthFromWeather(weather);
    return [0, 1].map(() => buildLookNodes(suggestOutfit(items, warm)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, inspOcc, inspStyle]);

  useEffect(() => {
    if (!homeCity) return;
    let cancelled = false;
    (async () => {
      const geo = await geocodeCity(homeCity);
      if (!geo) return;
      const days = await getDailyForecast(geo.latitude, geo.longitude, tomorrow, tomorrow);
      if (!cancelled && days[0]) setWeather(days[0]);
    })();
    return () => {
      cancelled = true;
    };
  }, [homeCity, tomorrow]);

  const toUnit = (c: number) => (tempUnit === 'F' ? Math.round((c * 9) / 5 + 32) : c);
  const weatherLine =
    homeCity && weather
      ? `${fmtDayShort(tomorrow)}  ·  ${homeCity}  ·  ${weatherInfo(weather.code).emoji} ${toUnit(weather.tMax)}° / ${toUnit(weather.tMin)}°`
      : fmtDayShort(tomorrow);

  const add = (m: Msg) => setMessages((list) => [...list, m]);

  const styleMe = async (prompt: string) => {
    if (thinking) return;
    const text = prompt.trim();
    add({ id: `u${Date.now()}`, role: 'user', text: text || 'Style me a look for tomorrow' });
    setDraft('');
    setThinking(true);
    try {
      const warmth = warmthFromWeather(weather);
      const look = await suggestOutfitSmart(items, warmth);
      const nodes = buildLookNodes(look);

      // A short stylist caption — from the configured LLM if any, else a friendly template.
      let caption: string | null = null;
      if (text) {
        const p = `You are a warm, concise personal stylist. The user said: "${text}". You picked these items: ${look
          .map((i) => i.name)
          .join(', ')}. Reply in one upbeat sentence about why this works${homeCity ? ` for ${weatherLine}` : ''}.`;
        try {
          caption = await remoteGenerate(p);
        } catch {
          caption = null;
        }
      }
      const title = TITLES[Math.floor(Math.random() * TITLES.length)];
      const fallback = look.length
        ? `${title} — here's a ${warmth === 'cold' ? 'warm, layered' : warmth === 'warm' ? 'light, breezy' : 'balanced'} look pulled from your closet.`
        : 'Add a few more items and I can style a full look for you.';

      add({
        id: `s${Date.now()}`,
        role: 'stylist',
        text: caption?.trim() || fallback,
        nodes: look.length ? nodes : undefined,
        meta: look.length ? weatherLine : undefined,
      });
    } finally {
      setThinking(false);
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    }
  };

  const sourceLine = appleIntelligenceAvailable
    ? 'On-device Apple Intelligence'
    : generateConfigured
      ? 'Styled by your AI endpoint'
      : 'Styled from your closet — on device';

  const header = (
    <TopBar
      left={<BackTitle title="Personal stylist" onBack={() => router.back()} />}
      right={
        <Pressable onPress={() => router.push('/stylist/settings')} style={styles.settingsBtn}>
          <Txt variant="caption">Styling settings</Txt>
        </Pressable>
      }
    />
  );

  return (
    <Screen header={header} scroll={false} bottomInset={false}>
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: Spacing.lg }}
        showsVerticalScrollIndicator={false}
        onLayout={(e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width)}>
        <Txt variant="small" color="textMuted">A style planner that understands you better than you do.</Txt>
        <View style={styles.sourceRow}>
          <Ionicons name="sparkles" size={12} color={palette.blue} />
          <Txt variant="caption" color="accent">{sourceLine}</Txt>
        </View>

        {owned.length < ENOUGH ? (
          <View style={styles.notEnough}>
            <Ionicons name="information-circle" size={20} color={palette.blue} />
            <View style={{ flex: 1 }}>
              <Txt variant="bodyStrong">Not enough items</Txt>
              <Txt variant="caption" color="textMuted">
                Add {ENOUGH - owned.length} more to get looks built entirely from your closet.
              </Txt>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${(owned.length / ENOUGH) * 100}%` }]} />
              </View>
            </View>
            <Txt variant="caption" color="textMuted">{owned.length}/{ENOUGH}</Txt>
          </View>
        ) : null}

        {messages.length === 0 ? (
          <View style={styles.starter}>
            <Txt style={{ fontSize: 34 }}>🧑‍🎨</Txt>
            <Txt variant="title">What's the plan tomorrow?</Txt>
            <Txt variant="small" color="textMuted" style={{ textAlign: 'center' }}>
              Tell me the occasion or vibe and I'll pull a look from your wardrobe.
            </Txt>
            <Pressable onPress={() => router.push('/stylist/quiz')} style={styles.quizBtn}>
              <Ionicons name="sparkles-outline" size={15} color={palette.blue} />
              <Txt variant="small" color="accent">Take the style quiz</Txt>
            </Pressable>
          </View>
        ) : null}

        {messages.map((m) =>
          m.role === 'user' ? (
            <View key={m.id} style={styles.userBubble}>
              <Txt variant="small" color="onPrimary">{m.text}</Txt>
            </View>
          ) : (
            <View key={m.id} style={styles.stylistBlock}>
              {m.meta ? <Txt variant="caption" color="textMuted" style={{ marginBottom: 6 }}>{m.meta}</Txt> : null}
              <Txt variant="body" style={{ marginBottom: m.nodes ? Spacing.md : 0 }}>{m.text}</Txt>
              {m.nodes && w > 0 ? (
                <Pressable onPress={() => router.push('/stylist/suggest')} style={styles.lookCard}>
                  <OutfitPreview items={items} nodes={m.nodes} size={w - Spacing.lg * 2 - 2} />
                </Pressable>
              ) : null}
            </View>
          ),
        )}

        {thinking ? (
          <View style={styles.thinking}>
            <ActivityIndicator color={palette.blue} />
            <Txt variant="small" color="accent">Scanning your wardrobe…</Txt>
          </View>
        ) : null}

        {inspLooks.length > 0 ? (
          <View style={styles.inspBlock}>
            <Txt variant="h2" style={{ marginBottom: Spacing.sm }}>Outfit Inspiration</Txt>
            <Txt variant="label" color="textSecondary">Occasion</Txt>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagRow}>
              {OCCASION_TAGS.map((t) => (
                <Chip key={t} label={t} selected={inspOcc === t} onPress={() => setInspOcc(t)} />
              ))}
            </ScrollView>
            <Txt variant="label" color="textSecondary" style={{ marginTop: Spacing.md }}>Style</Txt>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagRow}>
              {STYLE_TAGS.map((t) => (
                <Chip key={t} label={t} selected={inspStyle === t} onPress={() => setInspStyle(t)} />
              ))}
            </ScrollView>
            {w > 0 ? (
              <View style={styles.inspGrid}>
                {inspLooks.map((nodes, i) => (
                  <Pressable key={i} style={styles.inspCard} onPress={() => router.push('/stylist/suggest')}>
                    <OutfitPreview items={items} nodes={nodes} size={(w - Spacing.md) / 2} />
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.composer}>
        <Chip label="✨ Style with Items" selected onPress={() => styleMe('')} />
        <View style={styles.inputRow}>
          <View style={{ flex: 1 }}>
            <Input
              placeholder="Write a message"
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={() => styleMe(draft)}
              returnKeyType="send"
            />
          </View>
          <IconButton onPress={() => styleMe(draft)} style={styles.send}>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </IconButton>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sourceRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6, marginBottom: Spacing.md },
  notEnough: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: palette.cloud,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  track: { height: 6, borderRadius: 3, backgroundColor: palette.mist, overflow: 'hidden', marginTop: 8 },
  fill: { height: '100%', backgroundColor: palette.blue, borderRadius: 3 },
  starter: { alignItems: 'center', gap: 8, paddingVertical: Spacing.six },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: palette.black,
    borderRadius: Radius.lg,
    borderBottomRightRadius: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
    maxWidth: '85%',
  },
  stylistBlock: {
    alignSelf: 'flex-start',
    backgroundColor: palette.cloud,
    borderRadius: Radius.lg,
    borderBottomLeftRadius: 4,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    maxWidth: '92%',
  },
  lookCard: { borderRadius: Radius.md, overflow: 'hidden', backgroundColor: palette.white },
  thinking: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: Spacing.md },
  settingsBtn: { borderWidth: 1, borderColor: palette.hairline, borderRadius: Radius.pill, paddingHorizontal: 12, paddingVertical: 7 },
  quizBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.md, backgroundColor: palette.blueSoft, paddingHorizontal: 14, paddingVertical: 9, borderRadius: Radius.pill },
  inspBlock: { marginTop: Spacing.xl, paddingTop: Spacing.lg, borderTopWidth: 1, borderTopColor: palette.hairline },
  tagRow: { gap: 8, paddingVertical: Spacing.sm },
  inspGrid: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.md },
  inspCard: { flex: 1, aspectRatio: 1, borderRadius: Radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: palette.hairline, backgroundColor: palette.white },
  composer: { gap: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: palette.hairline },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  send: { backgroundColor: palette.blue, borderRadius: Radius.pill, width: 44, height: 44 },
});
