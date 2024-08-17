import { StatusBar, StyleSheet } from "react-native";
import { colors } from "../constants/colors";

export const pageStyles = StyleSheet.create({
  page: {
    paddingTop: (StatusBar.currentHeight || 0) + 20,
    paddingBottom: StatusBar.currentHeight || 20,
    flex: 1,
    backgroundColor: colors.black,
    alignItems: "center",
  },
});
