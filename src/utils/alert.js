// Alert.alert does nothing in the browser (react-native-web), so fall back to
// window.alert / window.confirm there.
import { Alert, Platform } from 'react-native';

export function showAlert(title, message, buttons) {
    if (Platform.OS !== 'web') {
        Alert.alert(title, message, buttons);
        return;
    }
    const text = [title, message].filter(Boolean).join('\n\n');
    const cancel = buttons?.find((b) => b.style === 'cancel');
    const action = buttons?.find((b) => b.style !== 'cancel');
    if (cancel && action) {
        if (window.confirm(text)) action.onPress?.();
        else cancel.onPress?.();
        return;
    }
    window.alert(text);
    action?.onPress?.();
}
