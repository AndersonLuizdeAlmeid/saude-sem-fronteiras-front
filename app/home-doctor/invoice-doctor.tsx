import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderPage from "../../components/HeaderPage";
import { router } from "expo-router";
import { colors } from "../../constants/colors";
import { ScrollView } from "react-native";
import SelectionModal from "../../components/CustomModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_DOCTOR, STORAGE_PATIENT } from "../../constants/storage";
import { apiDelete, apiGet, apiPut } from "../../utils/api";
import SimpleModal from "../../components/Modal";
import Button from "../../components/Button";
import { CertificateShow } from "../../domain/Certificate/certificateShow";
import { downloadAndOpenDocument } from "../../utils/dowloadFile";
import { Patient } from "../../domain/Patient/patient";
import WaitingListPageInvoice from "../../components/WaitingListPageInvoice";
import { InvoiceShow } from "../../domain/Invoice/invoicesShow";
import CardIcon from "../../components/CardIcon";
import { Doctor } from "../../domain/Doctor/doctor";
import WebView from "react-native-webview";
import ModalHTML from "../../components/ModalHTML";

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
  const [invoice, setInvoice] = useState<{
    id: number;
    description: string;
  } | null>(null);
  const [filter, setFilter] = useState<number>(2);

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

  //mudar para documents
  const getInvoices = async () => {
    try {
      const value = await AsyncStorage.getItem(STORAGE_DOCTOR);
      if (value) {
        const doctor: Doctor = JSON.parse(value);
        const response = await apiGet(`/Invoice/doctor/${doctor.id}`);
        console.log(response.data);
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
          console.log("Nenhum valor encontrado no AsyncStorage");
        }
      } else {
        setMessageModal("Formato de resposta inesperado");
        setErrorModalVisible(true);
      }
    } catch (error) {
      setMessageModal("Erro ao buscar consultas:");
      setErrorModalVisible(true);
    }
  };

  const handleFinishShift = async () => {
    try {
      if (status !== 2) {
        const status = 2;
        await apiPut("/Invoice/", { id: invoiceId, status });
      } else {
        setMessageModal("Fatura já está finalizada.");
        setErrorModalVisible(true);
      }
    } catch {
      setMessageModal("Problema ao alterar Fatura.");
      setErrorModalVisible(true);
    }
  };

  const handleViewShift = async () => {
    if (selectedInvoice.id !== null) {
      viewInvoice();
    } else {
      setMessageModal("Selecione algum documento.");
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
          setMessageModal("Status da fatura está finalizado.");
          setErrorModalVisible(true);
        }
      } catch (error) {
        setMessageModal("Erro ao deletar a fatura.");
        setErrorModalVisible(true);
      }
    }
  };

  useEffect(() => {
    getInvoices();
    if (selectedInvoice === null) {
      handleSelectDocument;
    }
  }, []);

  const filterDocuments = (documents: any[]) => {
    if (!filter || filter < 1 || filter > 3) {
      setMessageModal("Selecione um tipo de fatura válida.");
      setErrorModalVisible(true);
      return documents; // Retorna todas as consultas se o filtro for inválido
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
        visible={isHtmlModalVisible} // Controla se o modal está visível
        htmlContent={htmlContent} // Passa o HTML para ser renderizado
        onClose={handleCloseModalHTML} // Função para fechar o modal
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
