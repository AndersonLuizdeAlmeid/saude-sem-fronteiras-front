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

const PatientRegistryPage: React.FC = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [offset] = useState(new Animated.ValueXY({ x: 0, y: 95 }));
  const [opacity] = useState(new Animated.Value(0));
  const [bloodType, setBloodType] = useState("");
  const [allergy, setAllergy] = useState("");
  const [medicalCondition, setMedicalCondition] = useState("");
  const [previousSurgery, setPreviousSurgery] = useState("");
  const [medicines, setMedicines] = useState("");
  const [emergencyNumber, seteEmergencyNumber] = useState("");
  const name = "Anderson Luiz de Almeida";

  const handleBackPress = () => {
    router.replace("/register/doctor-patient-register");
  };

  async function handleAddressRegistry() {
    router.replace("/home-patient");
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
                label=""
                autoCorrect={false}
                value={name}
                onChangeText={(value) => {
                  setBloodType(value);
                }}
                style={styles.inputPrincipal}
                autoCapitalize="none"
              />
              <Input
                label="Tipo Sanguíneo"
                autoCorrect={false}
                placeholder="O+"
                value={bloodType}
                onChangeText={(value) => {
                  setBloodType(value);
                }}
                secureTextEntry
                style={styles.input}
              />
              <Input
                label="Alergias"
                autoCorrect={false}
                placeholder="Abelha, Gato"
                value={allergy}
                onChangeText={(value) => {
                  setAllergy(value);
                }}
                secureTextEntry
                style={styles.input}
              />
              <Input
                label="Condição Médica"
                autoCorrect={false}
                placeholder="Saudável"
                value={medicalCondition}
                onChangeText={(value) => {
                  setMedicalCondition(value);
                }}
                secureTextEntry
                style={styles.input}
              />
              <Input
                label="Cirurgias Anteriores"
                autoCorrect={false}
                placeholder="Apêndice"
                value={previousSurgery}
                onChangeText={(value) => {
                  setPreviousSurgery(value);
                }}
                secureTextEntry
                style={styles.input}
              />
              <Input
                label="Medicamentos"
                autoCorrect={false}
                placeholder="Rivotril"
                value={medicines}
                onChangeText={(value) => {
                  setMedicines(value);
                }}
                secureTextEntry
                style={styles.input}
              />
              <Input
                label="Número de emergencia"
                autoCorrect={false}
                placeholder="54997020294"
                value={emergencyNumber}
                onChangeText={(value) => {
                  seteEmergencyNumber(value);
                }}
                secureTextEntry
                style={styles.input}
              />
              <Button onPress={handleAddressRegistry} style={styles.button}>
                CADASTRAR
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
  inputPrincipal: {
    width: 320,
    height: 50,
    fontSize: 15,
    marginBottom: 20,
    backgroundColor: colors.black,
  },
  button: {
    marginTop: 20,
    width: 250,
  },
});

export default PatientRegistryPage;
