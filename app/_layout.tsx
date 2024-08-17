import type { ReactNode } from "react";
import { Slot } from "expo-router";
import { useFonts } from "expo-font";

export default function RootLayout(): ReactNode {
  const [loadedFonts] = useFonts({
    PoppinsRegular: require("../assets/fonts/Poppins-Regular.ttf"),
    PoppinsBold: require("../assets/fonts/Poppins-Bold.ttf"),
    //Poppins: require("../assets/fonts/Poppins.ttf"),
  });

  if (!loadedFonts) return null;

  return <Slot />;
}
