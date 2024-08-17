import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/colors";

interface InfoContainerProps {
  title: string;
  value: string;
}

export default function InfoContainer({ title, value }: InfoContainerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value || " -"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-start",
    justifyContent: "center",
  },

  title: {
    color: colors.white,
    fontSize: 14,
    fontFamily: "PoppinsRegular",
  },

  value: {
    color: colors.gray_3,
    fontSize: 14,
    fontFamily: "PoppinsRegular",
  },
});
