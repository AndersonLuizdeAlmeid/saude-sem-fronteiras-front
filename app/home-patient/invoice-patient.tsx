import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderPage from "../../components/HeaderPage";
import { router } from "expo-router";
import { colors } from "../../constants/colors";
import { ScrollView } from "react-native";
import SelectionModal from "../../components/CustomModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_PATIENT } from "../../constants/storage";
import { apiGet } from "../../utils/api";
import SimpleModal from "../../components/Modal";
import Button from "../../components/Button";
import { downloadAndOpenDocument } from "../../utils/dowloadFile";
import { Patient } from "../../domain/Patient/patient";
import WaitingListPageInvoice from "../../components/WaitingListPageInvoice";
import ModalHTML from "../../components/ModalHTML";
import ModalInput from "../../components/ModalInput";
import {
  ERROR_GET_APPOINTMENTS,
  ERROR_GET_PATIENT,
  ERROR_INVOICE_SELECTED,
  ERROR_INVOICE_VALID,
  ERROR_UPDATE_INVOICES,
} from "../../utils/messages";

const InvoicePatientPage: React.FC = () => {
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [resetSelection, setResetSelection] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isErrorModalVisible, setErrorModalVisible] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [invoiceId, setInvoiceId] = useState<number>(0);
  const [status, setStatus] = useState<number>(0);

  const [isHtmlModalVisible, setHtmlModalVisible] = useState(false);
  const [updateInvoice, setUpdateInvoice] = useState<number>(0);
  const [htmlContent, setHtmlContent] = useState<string>("");

  const [isModalInputVisible, setIsModalInputVisible] = useState(false);
  const [inputContent, setInputContent] = useState<string>("");

  const [messageModal, setMessageModal] = useState<string>("");
  const [invoices, setInvoices] = useState<
    { id: number; data: string; status: number }[]
  >([]);

  const [filter, setFilter] = useState<number>(1);

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

  const handleCloseModalHTML = () => {
    setHtmlModalVisible(false);
    setHtmlContent("");
  };

  const handleCloseModalInput = () => {
    setIsModalInputVisible(false);
    setInputContent("");
  };

  useEffect(() => {
    if (resetSelection) {
      setSelectedInvoice(null);
      setInvoiceId(0);
      setStatus(0);
      setResetSelection(false);
    }
  }, [resetSelection]);

  const getInvoices = async () => {
    try {
      const value = await AsyncStorage.getItem(STORAGE_PATIENT);
      if (value) {
        const patient: Patient = JSON.parse(value);
        const response = await apiGet(`/Invoice/patient/${patient.id}`);
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

          const formattedDocuments = response.data.map((item: any) => ({
            id: item.id,
            data: `${formatDate(item.date)} - ${item.name}`,
            status: item.status,
          }));

          setInvoices(formattedDocuments);
        } else {
          setMessageModal(ERROR_GET_APPOINTMENTS);
          setErrorModalVisible(true);
        }
      } else {
        setMessageModal(ERROR_GET_PATIENT);
        setErrorModalVisible(true);
      }
    } catch (error) {
      setMessageModal(ERROR_GET_APPOINTMENTS);
      setErrorModalVisible(true);
    }
  };

  const handleTypeableLine = async () => {
    switch (status) {
      case 1:
        viewInvoice();
        break;
      case 2:
        viewInvoice();
        break;
      case 3:
        viewInvoice();
        break;
      default:
        setMessageModal(ERROR_INVOICE_VALID);
        setErrorModalVisible(true);
        break;
    }
  };

  useEffect(() => {
    if (inputContent) {
      setIsModalInputVisible(true);
    }
  }, [inputContent]);

  const viewInvoice = async () => {
    const response = await apiGet<string>(
      `/Invoice/ticket/typeableLine/${invoiceId}`
    );
    if (response.data !== null) {
      setInputContent(response.data.toString()); // O modal só será aberto quando inputContent for atualizado
    }
  };

  const handleDownloadShift = async () => {
    switch (status) {
      case 1:
        downloadInvoice();
        break;
      case 2:
        downloadInvoice();
        break;
      default:
        setMessageModal(ERROR_INVOICE_SELECTED);
        setErrorModalVisible(true);
        break;
    }
  };

  const downloadInvoice = async () => {
    const response = await apiGet<string>(`/Invoice/ticket/html/${invoiceId}`);
    if (response.data !== null) {
      const logoUrl = "http://http://192.168.0.103:8081/assets/logo.png"; // Ajuste conforme necessário

      // Adiciona a imagem ao HTML
      const modifiedHtml = response.data.replace(
        '<div class="logo">Seu Logo Aqui</div>',
        `<div class="logo"><img src="${logoUrl}" alt="Logo" style="max-width: 100px;" /></div>`
      );

      downloadAndOpenDocument(modifiedHtml, "Fatura.doc");
    }
  };

  const updateInvoices = async () => {
    const value = await AsyncStorage.getItem(STORAGE_PATIENT);
    if (value) {
      const patient: Patient = JSON.parse(value);
      const response = await apiGet<string>(
        `/Invoice/verify/invoices/patient/${patient.id}`
      );
      if (response.data === null) {
        setMessageModal(ERROR_UPDATE_INVOICES);
        setErrorModalVisible(true);
      }
    } else {
      setMessageModal(ERROR_GET_PATIENT);
      setErrorModalVisible(true);
    }
  };

  useEffect(() => {
    updateInvoices();
    setUpdateInvoice(1);
  }, []);

  useEffect(() => {
    getInvoices();
    if (selectedInvoice === null) {
      handleSelectDocument;
    }
  }, [updateInvoice]);

  const filterDocuments = (documents: any[]) => {
    if (!filter || filter < 1 || filter > 3) {
      setMessageModal(ERROR_INVOICE_VALID);
      setErrorModalVisible(true);
      return documents; // Retorna todas as consultas se o filtro for inválido
    }
    const filtered = documents.filter((document) => {
      return document.status === filter;
    });

    return filtered;
  };

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
          <WaitingListPageInvoice
            onSelect={handleSelectDocument}
            consultations={filterDocuments(invoices)}
            resetSelection={resetSelection}
          />
        </ScrollView>
        <View style={styles.buttonContainer}>
          <Button onPress={handleTypeableLine} style={styles.button}>
            LINHA DIGITÁVEL
          </Button>
          <Button onPress={handleDownloadShift} style={styles.button}>
            BAIXAR
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
        visible={isHtmlModalVisible} // Controla se o modal está visível
        htmlContent={htmlContent} // Passa o HTML para ser renderizado
        onClose={handleCloseModalHTML} // Função para fechar o modal
      />
      <ModalInput
        visible={isModalInputVisible} // Controla se o modal está visíveL
        onClose={handleCloseModalInput} // Função para fechar o modal
        message={inputContent}
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
    paddingHorizontal: 15,
  },
  activeButton: {
    margin: 5,
    backgroundColor: colors.gray_1,
  },
});

export default InvoicePatientPage;
