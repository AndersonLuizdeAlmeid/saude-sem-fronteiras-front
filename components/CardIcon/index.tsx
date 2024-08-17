import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../constants/colors";
import Icon from "react-native-vector-icons/FontAwesome5";

interface CardIconProps {
  text: string;
  icon: string;
  onPress: () => void;
}

export default function CardIcon({ text, icon, onPress }: CardIconProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Icon name={icon} size={50} color={colors.white} />
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 100,
    borderColor: colors.white,
    borderRadius: 5,
    borderWidth: 2,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  text: {
    paddingLeft: 20,
    color: colors.white,
    fontSize: 20,
    fontFamily: "PoppinsRegular",
    maxWidth: 170,
    textAlign: "center",
  },
});
