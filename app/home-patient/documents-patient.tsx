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
import WaitingListPage from "../../components/WaitingListPage";

const DocumentsPatientPage: React.FC = () => {
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isErrorModalVisible, setErrorModalVisible] = useState(false);
  const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [date, setDate] = useState<string>("");
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const [offset] = useState(new Animated.ValueXY({ x: 0, y: 95 }));
  const [opacity] = useState(new Animated.Value(0));
  const [appointmentLabel, setAppointmentLabel] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [selectedDocument, setDocument] = useState("");
  const [messageModal, setMessageModal] = useState<string>("");

  const handleBackPress = () => {
    router.replace("/home-patient/appointments");
  };

  const handleAuxiliaryModalPress = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };
  const handleSelectConsultation = (consultation: any) => {
    setSelectedConsultation(consultation);
  };

  async function handleDocument() {
    // Verifica se todos os campos necessários estão preenchidos
    if (selectedDocument && date) {
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

  const appointment = ["Cardiologia", "Odontologia", "Dermatologia"];
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
                  label="Consultas"
                  data={appointment}
                  onSelect={setAppointmentLabel}
                  placeholder="Escolha uma consulta"
                />
              </View>
              <View style={styles.container}>
                <ComboBox
                  label="Tipo de documento"
                  data={appointment}
                  onSelect={setDocumentType}
                  placeholder="Exames, Receitas ou Atestados"
                />
              </View>

              <ScrollView>
                <Text style={styles.headerText}>Consultas em espera</Text>
                <WaitingListPage onSelect={handleSelectConsultation} />
              </ScrollView>
              <Button onPress={handleDocument} style={styles.button}>
                VISUALIZAR
              </Button>
              <Button onPress={handleDocument} style={styles.button}>
                COMPARTILHAR
              </Button>
              <Button onPress={handleDocument} style={styles.button}>
                BAIXAR
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
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  scrollViewContent: {
    paddingVertical: 20,
    alignItems: "center",
  },
  headerText: {
    color: colors.white,
    fontSize: 20,
    padding: 10,
    marginBottom: -20,
    textAlign: "center",
    fontFamily: "PoppinsRegular",
  },
  formContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    marginTop: 20,
    width: 250,
  },
});

export default DocumentsPatientPage;
