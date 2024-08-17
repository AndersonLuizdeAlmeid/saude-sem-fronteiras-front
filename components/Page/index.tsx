import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { pageStyles } from "../../utils/pageStyle";

interface PageProps {
  children: React.ReactNode;
}

export default function Page({ children }: PageProps) {
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <View style={pageStyles.page}>
          <View style={styles.size}>{children}</View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  size: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    width: "80%",
  },
});
