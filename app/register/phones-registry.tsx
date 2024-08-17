import React, { useEffect, useState } from "react";
import { View, StyleSheet, Animated, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderPage from "../../components/HeaderPage";
import { router } from "expo-router";
import { colors } from "../../constants/colors";
import { ScrollView } from "react-native";
import CardIcon from "../../components/CardIcon";
import WaitingListPage from "../../components/WaitingListPage";
import Button from "../../components/Button";
import Input from "../../components/Input";

const PhonesRegistryPage: React.FC = () => {
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null);
  const [offset] = useState(new Animated.ValueXY({ x: 0, y: 95 }));
  const [opacity] = useState(new Animated.Value(0));
  const [phone, setPhone] = useState("");

  const handleBackPress = () => {
    router.replace("/register/address-registry");
  };

  const handleAuxiliaryModalPress = () => {
    router.replace("/register/doctor-patient-register");
  };

  const handleSelectConsultation = (consultation: any) => {
    setSelectedConsultation(consultation);
  };

  const handleSavetShift = () => {
    handleAuxiliaryModalPress();
    // if (selectedConsultation) {
    //   // Processar a consulta selecionada
    //   console.log("Consulta selecionada:", selectedConsultation);
    //   router.replace("/registry");
    // } else {
    //   // Mostrar uma mensagem de erro ou alerta
    //   console.log("Nenhuma consulta selecionada");
    // }
  };

  const items = [
    {
      text: "Telefones",
      icon: "phone",
      //TODO remover esse onpress futuramente
      onPress: handleSavetShift,
    },
  ];

  useEffect(() => {
    Animated.parallel([
      Animated.spring(offset.y, {
        toValue: 0,
        speed: 4,
        useNativeDriver: true,
        bounciness: 20,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <HeaderPage
        title="Minha Página"
        onBackPress={handleBackPress}
        auxiliaryModalPress={handleAuxiliaryModalPress}
      />
      <Animated.View
        style={[
          styles.container,
          { opacity: opacity, transform: [{ translateY: offset.y }] },
        ]}
      >
        <View style={styles.content}>
          <ScrollView contentContainerStyle={styles.content}>
            {/* CardIcon e outros elementos antes do botão */}
            {items.map((i) => (
              <React.Fragment key={i.text}>
                <CardIcon {...i} />
                <View style={styles.separator} />
              </React.Fragment>
            ))}
            <Input
              label="Telefone"
              autoCorrect={false}
              placeholder="5499972516"
              value={phone}
              onChangeText={(value) => {
                setPhone(value);
              }}
              style={styles.input}
              autoCapitalize="none"
            />
            <WaitingListPage onSelect={handleSelectConsultation} />
            {/* Botão "Salvar" no final */}
            <Button onPress={handleSavetShift} style={styles.button}>
              SALVAR
            </Button>
          </ScrollView>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  separator: { height: 20 },
  input: {
    width: 320,
  },
  button: {
    marginTop: 20,
    width: 250,
  },
});

export default PhonesRegistryPage;
