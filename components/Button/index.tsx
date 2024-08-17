import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";
import { colors } from "../../constants/colors";

interface InputProps extends TouchableOpacityProps {
  loading?: boolean;
  onPress: () => void;
}

export default function Input({
  onPress,
  loading = false,
  children,
  ...rest
}: InputProps) {
  return (
    <TouchableOpacity
      {...rest}
      style={[styles.buttonSubmit, rest.style]}
      onPress={() => {
        if (loading) return;

        onPress();
      }}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.white} />
      ) : (
        <Text style={styles.textSubmit}>{children}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonSubmit: {
    width: "100%",
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    borderColor: colors.white,
    borderWidth: 2,
    backgroundColor: colors.black,
  },

  textSubmit: {
    color: colors.white,
    fontSize: 14,
    fontFamily: "PoppinsBold",
    paddingHorizontal: 12,
  },
});
