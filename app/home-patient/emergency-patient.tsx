import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Animated,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
} from "react-native";
import ComboBox from "../../components/ComboBox"; // Atualize o caminho conforme necessário
import { router } from "expo-router";
import SelectionModal from "../../components/CustomModal";
import Button from "../../components/Button";
import HeaderPage from "../../components/HeaderPage";
import DateTimePickerModal from "react-native-modal-datetime-picker"; // Importar a biblioteca
import { colors } from "../../constants/colors";
import SimpleModal from "../../components/Modal";

const EmergencyPatientPage: React.FC = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [isErrorModalVisible, setErrorModalVisible] = useState(false);
  const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [date, setDate] = useState<string>("");
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const [offset] = useState(new Animated.ValueXY({ x: 0, y: 95 }));
  const [opacity] = useState(new Animated.Value(0));
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [messageModal, setMessageModal] = useState<string>("");

  const handleBackPress = () => {
    router.back();
  };

  const handleAuxiliaryModalPress = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  async function handleSchedule() {
    // Verifica se todos os campos necessários estão preenchidos
    if (selectedSpecialty && date) {
      // Se tudo estiver preenchido corretamente, exibe o modal de sucesso
      setMessageModal("Agendamento realizado com sucesso!");
      setSuccessModalVisible(true);
    } else {
      // Se houver algum erro, exibe o modal de erro
      setMessageModal("Erro ao realizar o agendamento. Verifique os campos.");
      setErrorModalVisible(true);
    }
  }

  const handleSelectLabels = (labels: string[]) => {
    setSelectedLabels(labels);
    console.log("Labels selecionadas:", labels);
  };

  const handleConfirm = (selectedDate: Date) => {
    const formattedDate = selectedDate.toLocaleDateString(); // Formata a data conforme necessário
    setDate(formattedDate);
    setDatePickerVisibility(false);
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
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

  const specialties = ["Cardiologia", "Odontologia", "Dermatologia"];
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
              <View style={styles.container}>
                <ComboBox
                  label="Especialidade"
                  data={specialties}
                  onSelect={setSelectedSpecialty}
                  placeholder="Escolha a Especialidade"
                />
              </View>
              <View style={styles.container}>
                <ComboBox
                  label="Médico"
                  data={specialties}
                  onSelect={setSelectedSpecialty}
                  placeholder="Escolha a Especialidade"
                />
              </View>
              <TouchableOpacity onPress={showDatePicker}>
                <Text style={styles.inputName}>Data da Consulta</Text>
                <View style={styles.input}>
                  <Text style={styles.inputText}>
                    {date || "Aperte aqui para adicionar a data"}
                  </Text>
                </View>
              </TouchableOpacity>
              <View style={styles.container}>
                <ComboBox
                  label="Horário"
                  data={specialties}
                  onSelect={setSelectedSpecialty}
                  placeholder="Escolha a Especialidade"
                />
              </View>
              <Button onPress={handleSchedule} style={styles.button}>
                AGENDAR
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
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={() => setDatePickerVisibility(false)}
      />
      <SimpleModal
        visible={isErrorModalVisible}
        onClose={() => setErrorModalVisible(false)}
        message={messageModal}
      />
      <SimpleModal
        visible={isSuccessModalVisible}
        onClose={() => setSuccessModalVisible(false)}
        message={messageModal}
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
    paddingVertical: 20,
    alignItems: "center",
  },
  formContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    width: 320,
    marginBottom: 20,
    padding: 15,
    backgroundColor: colors.gray_2,
    borderColor: colors.white,
    borderWidth: 2,
    borderRadius: 5,
  },
  inputText: {
    color: colors.white,
  },
  inputName: {
    color: colors.white,
    paddingVertical: 5,
  },
  button: {
    marginTop: 20,
    width: 250,
  },
});

export default EmergencyPatientPage;
