import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  TouchableOpacity,
} from "react-native";
import { colors } from "../../constants/colors";
import Ionicons from "react-native-vector-icons/Ionicons"; // Você pode usar a biblioteca de ícones que preferir

interface InputProps extends TextInputProps {
  label: string;
  isPassword?: boolean; // Adiciona uma flag para campos de senha
}

export default function InputPassword({
  label,
  isPassword,
  ...rest
}: InputProps) {
  const [isPasswordVisible, setPasswordVisible] = useState(isPassword);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          {...rest}
          secureTextEntry={isPassword ? isPasswordVisible : false}
          style={[styles.input, rest.style]}
          placeholderTextColor={colors.gray_3}
          textAlignVertical="center"
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setPasswordVisible(!isPasswordVisible)}
            style={styles.icon}
          >
            <Ionicons
              name={isPasswordVisible ? "eye-off" : "eye"}
              size={20}
              color={colors.white}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  label: {
    color: colors.white,
    fontSize: 14,
    marginBottom: 5,
    fontFamily: "PoppinsRegular",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.gray_2,
    borderRadius: 5,
    borderColor: colors.white,
    borderWidth: 2,
    marginBottom: 30,
    height: 40,
    width: 320,
  },
  input: {
    flex: 1,
    color: colors.white,
    fontSize: 14,
    paddingLeft: 10,
    fontFamily: "PoppinsRegular",
  },
  icon: {
    padding: 10,
  },
});
