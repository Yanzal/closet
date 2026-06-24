import { View } from 'react-native';

import { Ionicons } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { Txt } from '@/components/ui/text';
import { palette } from '@/constants/theme';

/** Back chevron + title, used as the TopBar `left` on pushed screens. */
export function BackTitle({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, flexShrink: 1 }}>
      <IconButton onPress={onBack} size={36} style={{ marginLeft: -8 }}>
        <Ionicons name="chevron-back" size={26} color={palette.ink} />
      </IconButton>
      <Txt variant="h2" numberOfLines={1}>
        {title}
      </Txt>
    </View>
  );
}
