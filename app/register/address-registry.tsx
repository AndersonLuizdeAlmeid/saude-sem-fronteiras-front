import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Animated,
  View,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { colors } from "../../constants/colors";
import Input from "../../components/Input";
import Button from "../../components/Button";
import HeaderPage from "../../components/HeaderPage";
import SelectionModal from "../../components/CustomModal";

const AddressRegistryPage: React.FC = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [offset] = useState(new Animated.ValueXY({ x: 0, y: 95 }));
  const [opacity] = useState(new Animated.Value(0));
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");

  const handleBackPress = () => {
    router.replace("/register");
  };

  async function handleAddressRegistry() {
    router.replace("/register/phones-registry");
  }

  const handleAuxiliaryModalPress = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleSelectLabels = (labels: string[]) => {
    setSelectedLabels(labels);
    console.log("Labels selecionadas:", labels);
  };

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
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <Animated.View
            style={[
              styles.formContainer,
              { opacity: opacity, transform: [{ translateY: offset.y }] },
            ]}
          >
            <View style={styles.formContainer}>
              <Input
                label="País"
                autoCorrect={false}
                placeholder="Brasil"
                value={country}
                onChangeText={(value) => {
                  setCountry(value);
                }}
                style={styles.input}
                autoCapitalize="none"
              />
              <Input
                label="Estado"
                autoCorrect={false}
                placeholder="RS"
                value={state}
                onChangeText={(value) => {
                  setState(value);
                }}
                secureTextEntry
                style={styles.input}
              />
              <Input
                label="Cidade"
                autoCorrect={false}
                placeholder="Carlos Barbosa"
                value={city}
                onChangeText={(value) => {
                  setCity(value);
                }}
                secureTextEntry
                style={styles.input}
              />
              <Input
                label="Bairro"
                autoCorrect={false}
                placeholder="Ponte Seca"
                value={neighborhood}
                onChangeText={(value) => {
                  setNeighborhood(value);
                }}
                secureTextEntry
                style={styles.input}
              />
              <Input
                label="Rua"
                autoCorrect={false}
                placeholder="Evaristo Canal"
                value={street}
                onChangeText={(value) => {
                  setStreet(value);
                }}
                secureTextEntry
                style={styles.input}
              />
              <Input
                label="Número"
                autoCorrect={false}
                placeholder="186"
                value={number}
                onChangeText={(value) => {
                  setNumber(value);
                }}
                secureTextEntry
                style={styles.input}
              />
              <Input
                label="Complemento"
                autoCorrect={false}
                placeholder="casa de dois andares"
                value={complement}
                onChangeText={(value) => {
                  setComplement(value);
                }}
                secureTextEntry
                style={styles.input}
              />
              <Button onPress={handleAddressRegistry} style={styles.button}>
                PRÓXIMO
              </Button>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
      <SelectionModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        onSelect={handleSelectLabels}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  scrollViewContent: {
    paddingVertical: 20, // Adicione espaçamento vertical
    alignItems: "center", // Centraliza o conteúdo horizontalmente
  },
  formContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    width: 320,
    marginBottom: 20,
  },
  button: {
    marginTop: 20,
    width: 250,
  },
});

export default AddressRegistryPage;
