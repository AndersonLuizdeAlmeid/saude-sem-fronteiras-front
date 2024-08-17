import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";

interface HeaderPageProps {
  title: string;
  onBackPress: () => void;
  auxiliaryModalPress: () => void;
}

const HeaderPage: React.FC<HeaderPageProps> = ({
  title,
  onBackPress,
  auxiliaryModalPress,
}) => {
  return (
    <SafeAreaView style={styles.header}>
      <TouchableOpacity onPress={onBackPress} style={styles.iconButton}>
        <Icon name="arrow-left" size={20} color={colors.white} />
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
      <TouchableOpacity onPress={auxiliaryModalPress} style={styles.iconButton}>
        <Icon name="bars" size={20} color={colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 15,
    backgroundColor: colors.black,
  },
  iconButton: {
    padding: 10,
  },
  title: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default HeaderPage;
