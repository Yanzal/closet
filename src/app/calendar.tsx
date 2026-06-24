import { useRouter } from 'expo-router';

import { MonthCalendar } from '@/components/calendar/month-calendar';
import { BackTitle } from '@/components/sub-header';
import { TopBar } from '@/components/top-bar';
import { Screen } from '@/components/ui/screen';

export default function CalendarScreen() {
  const router = useRouter();
  return (
    <Screen header={<TopBar left={<BackTitle title="Calendar" onBack={() => router.back()} />} />}>
      <MonthCalendar />
    </Screen>
  );
}
