import { Alert, Platform } from 'react-native';

/** Lightweight "not built yet" notice for features in later milestones. */
export function comingSoon(title = 'Coming soon', message = 'This arrives in a later milestone.') {
  if (Platform.OS === 'web') {
    // RN Web's Alert only shows the title, so include the message there.
    Alert.alert(`${title} — ${message}`);
  } else {
    Alert.alert(title, message);
  }
}
