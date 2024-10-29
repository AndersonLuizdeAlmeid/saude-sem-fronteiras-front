import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderPage from "../../components/HeaderPage";
import { router } from "expo-router";
import { colors } from "../../constants/colors";
import { ScrollView } from "react-native";
import SelectionModal from "../../components/CustomModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_DOCTOR } from "../../constants/storage";
import { apiDelete, apiGet, apiPut } from "../../utils/api";
import SimpleModal from "../../components/Modal";
import Button from "../../components/Button";
import WaitingListPageInvoice from "../../components/WaitingListPageInvoice";
import CardIcon from "../../components/CardIcon";
import { Doctor } from "../../domain/Doctor/doctor";
import ModalHTML from "../../components/ModalHTML";
import {
  ERROR_DELETE_INVOICE,
  ERROR_GET_APPOINTMENTS,
  ERROR_GET_PATIENTS,
  ERROR_UPDATE_INVOICE,
  ERROR_UPDATE_INVOICES,
  FAIL_STORAGE_DOCTOR,
  FORMAT_INCORRECT,
  INVOICE_ALREADY_FINISHED,
  SELECT_DOCUMENT,
  SELECT_TYPE_INVOICE_VALID,
} from "../../utils/messages";
import ComboBox from "../../components/ComboBox";

const InvoiceDoctorPage: React.FC = () => {
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [resetSelection, setResetSelection] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isErrorModalVisible, setErrorModalVisible] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [invoiceId, setInvoiceId] = useState<number>(0);
  const [status, setStatus] = useState<number>(0);

  const [isHtmlModalVisible, setHtmlModalVisible] = useState(false);
  const [htmlContent, setHtmlContent] = useState<string>("");

  const [messageModal, setMessageModal] = useState<string>("");
  const [invoices, setInvoices] = useState<
    { id: number; data: string; status: number }[]
  >([]);
  const [filter, setFilter] = useState<number>(2);
  const [patients, setPatients] = useState<
    { id: number; label: string; comparativeId: number }[]
  >([]);
  const [patient, setPatient] = useState<{
    id: number;
    description: string;
  } | null>(null);
  const [patientId, setPatientId] = useState<number>(0);

  const handleBackPress = () => {
    router.back();
  };

  const handleAuxiliaryModalPress = () => {
    setModalVisible(true);
  };

  const handleSelectDocument = (document: any) => {
    setSelectedInvoice(document);
    setInvoiceId(document.id);
    setStatus(document.status);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleSelectLabels = (labels: string[]) => {
    setSelectedLabels(labels);
    console.log("Labels selecionadas:", labels);
  };

  const resetDocumentSelection = () => {
    setResetSelection(true); // Ativa reset
  };

  useEffect(() => {
    if (resetSelection) {
      setSelectedInvoice(null);
      setInvoiceId(0);
      setStatus(0);
      setResetSelection(false); // Reseta o controlador após o reset
    }
  }, [resetSelection]);

  const getPatients = async () => {
    try {
      const value = await AsyncStorage.getItem(STORAGE_DOCTOR);
      if (value) {
        const doctor: Doctor = JSON.parse(value);
        const responsePatients = await apiGet(
          `/Appointment/patients/doctor/${doctor.id}`
        );
        if (responsePatients && Array.isArray(responsePatients.data)) {
          const formattedPatients = responsePatients.data.map(
            (patient: { id: number; name: string }) => ({
              id: patient.id,
              label: patient.name,
              comparativeId: patient.id,
            })
          );
          setPatients(formattedPatients);
        }
      } else {
        setMessageModal(FAIL_STORAGE_DOCTOR);
        setErrorModalVisible(true);
      }
    } catch (error) {
      setMessageModal(ERROR_GET_APPOINTMENTS);
      setErrorModalVisible(true);
    }
  };

  const getInvoices = async () => {
    try {
      const value = await AsyncStorage.getItem(STORAGE_DOCTOR);
      if (value) {
        const doctor: Doctor = JSON.parse(value);
        const response = await apiGet(`/Invoice/doctor/${doctor.id}`);
        if (response && Array.isArray(response.data)) {
          const formatDate = (dateString: string) => {
            const date = new Date(dateString);
            const options: Intl.DateTimeFormatOptions = {
              year: "numeric",
              month: "numeric",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            };
            return date.toLocaleDateString("pt-BR", options);
          };

          const formattedInvoices = response.data.map((item: any) => ({
            id: item.id,
            data: `${formatDate(item.date)} - ${item.name}`,
            status: item.status,
          }));

          setInvoices(formattedInvoices);
        } else {
          setMessageModal(FAIL_STORAGE_DOCTOR);
          setErrorModalVisible(true);
        }
      } else {
        setMessageModal(FORMAT_INCORRECT);
        setErrorModalVisible(true);
      }
    } catch (error) {
      setMessageModal(ERROR_GET_APPOINTMENTS);
      setErrorModalVisible(true);
    }
  };

  const handleFinishShift = async () => {
    try {
      if (status !== 2) {
        const status = 2;
        await apiPut("/Invoice/", { id: invoiceId, status });
      } else {
        setMessageModal(INVOICE_ALREADY_FINISHED);
        setErrorModalVisible(true);
      }
    } catch {
      setMessageModal(ERROR_UPDATE_INVOICE);
      setErrorModalVisible(true);
    }
  };

  const handleViewShift = async () => {
    if (selectedInvoice.id !== null) {
      viewInvoice();
    } else {
      setMessageModal(SELECT_DOCUMENT);
      setErrorModalVisible(true);
    }
  };

  const viewInvoice = async () => {
    const response = await apiGet<string>(`/Invoice/ticket/html/${invoiceId}`);

    if (response.data !== null) {
      setHtmlContent(response.data); // Armazena o HTML recebido
      setHtmlModalVisible(true); // Mostra o modal
    }
  };

  const handleCloseModalHTML = () => {
    setHtmlModalVisible(false);
    setHtmlContent("");
  };

  const handleDeletetShift = async () => {
    if (selectedInvoice && selectedInvoice.id) {
      try {
        if (selectedInvoice.id === 2) {
          await apiDelete(`/Invoice/${selectedInvoice.id}`);

          const updatedInvoices = invoices.filter(
            (invoice) => invoice.id !== selectedInvoice.id
          );
          setInvoices(updatedInvoices);

          setSelectedInvoice(null);
          setInvoiceId(0);
          setStatus(0);
          setResetSelection(true);

          getInvoices();
        } else {
          setMessageModal(INVOICE_ALREADY_FINISHED);
          setErrorModalVisible(true);
        }
      } catch (error) {
        setMessageModal(ERROR_DELETE_INVOICE);
        setErrorModalVisible(true);
      }
    }
  };

  useEffect(() => {
    const loadPatients = async () => {
      try {
        if (patientId !== null && patientId !== 0) {
          const value = await AsyncStorage.getItem(STORAGE_DOCTOR);
          if (value) {
            const doctor: Doctor = JSON.parse(value);
            const response = await apiGet(`/Invoice/doctor/${doctor.id}`);
            if (response && Array.isArray(response.data)) {
              const formatDate = (dateString: string) => {
                const date = new Date(dateString);
                const options: Intl.DateTimeFormatOptions = {
                  year: "numeric",
                  month: "numeric",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                };
                return date.toLocaleDateString("pt-BR", options);
              };

              const formattedInvoices = response.data.map((item: any) => ({
                id: item.id,
                data: `${formatDate(item.date)} - ${item.name}`,
                status: item.status,
              }));

              setInvoices(formattedInvoices);
            }
          } else {
            setMessageModal(FAIL_STORAGE_DOCTOR);
            setErrorModalVisible(true);
          }
        } else {
          getPatients();
          if (selectedInvoice === null) {
            handleSelectDocument;
          }
        }
      } catch {
        setMessageModal(ERROR_GET_PATIENTS);
        setErrorModalVisible(true);
      }
    };
    loadPatients();
  }, [patientId]);

  const updateInvoices = async () => {
    const value = await AsyncStorage.getItem(STORAGE_DOCTOR);
    if (value) {
      const patient: Doctor = JSON.parse(value);
      const response = await apiGet<string>(
        `/Invoice/verify/invoices/patient/${patient.id}`
      );
      if (response.data === null) {
        setMessageModal(ERROR_UPDATE_INVOICES);
        setErrorModalVisible(true);
      }
    } else {
      setMessageModal(FAIL_STORAGE_DOCTOR);
      setErrorModalVisible(true);
    }
  };

  useEffect(() => {
    updateInvoices();
  }, []);

  useEffect(() => {
    getPatients();
    getInvoices();
    if (selectedInvoice === null) {
      handleSelectDocument;
    }
  }, [patientId]);

  const filterDocuments = (documents: any[]) => {
    if (!filter || filter < 1 || filter > 3) {
      setMessageModal(SELECT_TYPE_INVOICE_VALID);
      setErrorModalVisible(true);
      return documents;
    }
    const filtered = documents.filter((document) => {
      return document.status === filter;
    });

    return filtered;
  };

  const handleCreateInvoice = () => {
    router.replace("/home-doctor/create-invoice");
  };

  const items = [
    {
      text: "Gerar Fatura",
      icon: "file-invoice",
      onPress: handleCreateInvoice,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <HeaderPage
        title="Faturas"
        onBackPress={handleBackPress}
        auxiliaryModalPress={handleAuxiliaryModalPress}
      />
      <View style={styles.content}>
        <View style={styles.filterContainer}>
          <Button
            onPress={() => {
              setFilter(1);
              resetDocumentSelection();
            }}
            style={filter === 1 ? styles.activeButton : styles.buttonPrincipal}
          >
            À Vencer
          </Button>
          <Button
            onPress={() => {
              setFilter(2);
              resetDocumentSelection();
            }}
            style={filter === 2 ? styles.activeButton : styles.buttonPrincipal}
          >
            Pagas
          </Button>
          <Button
            onPress={() => {
              setFilter(3);
              resetDocumentSelection();
            }}
            style={filter === 3 ? styles.activeButton : styles.buttonPrincipal}
          >
            Vencidas
          </Button>
        </View>
        <ScrollView>
          {items.map((i) => (
            <React.Fragment key={i.text}>
              <CardIcon {...i} />
            </React.Fragment>
          ))}
          <ComboBox
            label="Paciente"
            data={patients}
            onSelect={(selectedPatient) => {
              setPatient({
                id: selectedPatient.id,
                description: selectedPatient.label,
              });
              setPatientId(selectedPatient.id);
            }}
            placeholder="Escolha o paciente"
            value={patient ? patient.description : ""}
          />
          <WaitingListPageInvoice
            onSelect={handleSelectDocument}
            consultations={filterDocuments(invoices)}
            resetSelection={resetSelection}
          />
        </ScrollView>
        <View style={styles.buttonContainer}>
          <Button onPress={handleViewShift} style={styles.button}>
            VISUALIZAR
          </Button>
          <Button onPress={handleFinishShift} style={styles.button}>
            CONCLUIR
          </Button>
          <Button onPress={handleDeletetShift} style={styles.button}>
            EXCLUIR
          </Button>
        </View>
      </View>
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
      <ModalHTML
        visible={isHtmlModalVisible}
        htmlContent={htmlContent}
        onClose={handleCloseModalHTML}
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 25,
  },
  button: {
    marginHorizontal: 5,
    flex: 1,
  },
  buttonPrincipal: {
    marginTop: 5,
    width: 100,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    maxWidth: 150,
    marginBottom: 10,
    paddingHorizontal: 15,
  },
  activeButton: {
    margin: 5,
    backgroundColor: colors.gray_1,
  },
  webView: {
    flex: 1,
  },
});

export default InvoiceDoctorPage;
