import { useRouter } from 'expo-router';

import { Avatar } from '@/components/ui/avatar';
import { Ionicons } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { palette } from '@/constants/theme';
import { useCloset } from '@/store/closet';

/** Right-side header cluster (calendar / notifications / avatar) used on Home + Closet. */
export function HeaderActions() {
  const router = useRouter();
  const name = useCloset((s) => s.profileName);
  return (
    <>
      <IconButton onPress={() => router.push('/calendar')}>
        <Ionicons name="calendar-outline" size={22} color={palette.ink} />
      </IconButton>
      <IconButton onPress={() => router.push('/notifications')}>
        <Ionicons name="notifications-outline" size={22} color={palette.ink} />
      </IconButton>
      <IconButton onPress={() => router.push('/profile')} size={40}>
        <Avatar name={name || 'Guest'} size={32} />
      </IconButton>
    </>
  );
}
