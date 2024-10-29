import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderPage from "../../components/HeaderPage";
import { router } from "expo-router";
import { colors } from "../../constants/colors";
import { ScrollView } from "react-native";
import CardIcon from "../../components/CardIcon";
import SelectionModal from "../../components/CustomModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_DOCTOR } from "../../constants/storage";
import { apiDelete, apiGet } from "../../utils/api";
import SimpleModal from "../../components/Modal";
import WaitingListPageDocument from "../../components/WaitingListPageDocument";
import { Doctor } from "../../domain/Doctor/doctor";
import Button from "../../components/Button";
import { CertificateShow } from "../../domain/Certificate/certificateShow";
import { downloadAndOpenDocument } from "../../utils/dowloadFile";
import { ExamShow } from "../../domain/Exam/examShow";
import { PrescriptionShow } from "../../domain/Prescription/prescriptionShow";
import {
  ANY_APPOINTMENT_DELETE,
  ERROR_APPOINTMENT_DELETE,
  ERROR_GET_APPOINTMENTS,
  ERROR_GET_PATIENTS,
  FAIL_STORAGE_DOCTOR,
  FORMAT_INCORRECT,
  SELECT_DOCUMENT,
  SELECT_INVOICE_VALID,
} from "../../utils/messages";
import ComboBox from "../../components/ComboBox";

const DocumentsDoctorPage: React.FC = () => {
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [resetSelection, setResetSelection] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isErrorModalVisible, setErrorModalVisible] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [documentId, setDocumentId] = useState<number>(0);
  const [type, setType] = useState<number>(0);
  const [messageModal, setMessageModal] = useState<string>("");
  const [documents, setDocuments] = useState<
    { id: number; data: string; type: number }[]
  >([]);
  const [document, setDocument] = useState<{
    id: number;
    description: string;
  } | null>(null);

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
    setSelectedDocument(document);
    setDocumentId(document.id);
    setType(document.type);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleSelectLabels = (labels: string[]) => {
    setSelectedLabels(labels);
    console.log("Labels selecionadas:", labels);
  };

  useEffect(() => {
    if (resetSelection) {
      setSelectedDocument(null);
      setDocumentId(0);
      setType(0);
      setResetSelection(false);
    }
  }, [resetSelection]);

  const generateMedicalCertificate = (
    name: string,
    cpf: string,
    days: number,
    cid: number,
    nameDoctor: string,
    crm: string,
    cityDescription: string
  ) => {
    const currentDate = new Date();
    const locale = "pt-BR";
    const formattedDate = currentDate.toLocaleDateString(locale, {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    return `
      ATESTADO MÉDICO
  
      Atesto para os devidos fins, a pedido, que o(a) Sr(a). ${name}, inscrito(a) no CPF sob o nº ${cpf}, paciente sob meus cuidados, foi atendido(a) no dia ${formattedDate}, apresentando quadro de CID ${cid} e necessitando de ${days} dias de repouso.
  
                     ${cityDescription}, ${formattedDate}.
                          
                              ${nameDoctor}
                              CRM (${crm})
    `;
  };

  const generateExam = (
    namePatient: string,
    age: number,
    gender: string,
    date: Date,
    description: string,
    justification: string,
    nameDoctor: string,
    registryNumber: string
  ) => {
    return `
    SOLICITAÇÃO DE EXAMES

    Paciente: ${namePatient}
    Idade: ${age}
    Sexo: ${gender}
    Data: ${date}

    Por meio deste, gostaria de solicitar a realização dos seguintes exames para o paciente acima mencionado no âmbito do tratamento fisioterapêutico:

    1. ${description}
      - Justificativa: ${justification}

    Agradecemos antecipadamente pela atenção e colaboração.

    Atenciosamente,

    ${nameDoctor}
    CRM: ${registryNumber}
  `;
  };

  const generatePrescription = (
    namePatient: string,
    street: string,
    number: string,
    district: string,
    city: string,
    state: string,
    date: Date,
    nameDoctor: string,
    registryNumber: string,
    itemsText: string
  ) => {
    return `
    PRESCRIÇÃO MÉDICA
  
    Paciente: ${namePatient}
    Endereço: ${street}, ${number}, ${district}, ${city}/${state}
    Data: ${new Date(date).toLocaleDateString()}
  
    Medicações Prescritas:
    ${itemsText}
  
    Atenciosamente,
  
    ${nameDoctor}
    CRM: ${registryNumber}
    `;
  };

  const getDocuments = async () => {
    try {
      const value = await AsyncStorage.getItem(STORAGE_DOCTOR);
      if (value) {
        const doctor: Doctor = JSON.parse(value);
        const response = await apiGet(`/Document/doctor/${doctor.id}`);
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
            type: item.type,
          }));

          setDocuments(formattedDocuments);
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

  const handleViewShift = async () => {
    switch (type) {
      case 1:
        viewCertificate();
        break;
      case 2:
        viewExam();
        break;
      case 3:
        viewPrescription();
        break;
      default:
        setMessageModal(SELECT_DOCUMENT);
        setErrorModalVisible(true);
        break;
    }
  };

  const viewCertificate = async () => {
    const response = await apiGet<CertificateShow>(
      `/Certificate/id/${documentId}`
    );
    if (response.data !== null) {
      const certificateText = generateMedicalCertificate(
        response.data.name,
        response.data.cpf,
        response.data.days,
        response.data.cid,
        response.data.nameDoctor,
        response.data.crm,
        response.data.cityDescription
      );
      setMessageModal(certificateText);
      setErrorModalVisible(true);
    }
  };

  const viewExam = async () => {
    const response = await apiGet<ExamShow>(`/Exam/document/${documentId}`);
    console.log(response.data);
    if (response.data !== null) {
      const certificateText = generateExam(
        response.data.namePatient,
        response.data.age,
        response.data.gender,
        response.data.date,
        response.data.description,
        response.data.justification,
        response.data.nameDoctor,
        response.data.registryNumber
      );
      setMessageModal(certificateText);
      setErrorModalVisible(true);
    }
  };

  const viewPrescription = async () => {
    const response = await apiGet<PrescriptionShow[]>(
      `/Prescription/documentId/${documentId}`
    );

    if (response.data !== null && response.data.length > 0) {
      const {
        namePatient,
        street,
        number,
        district,
        date,
        city,
        state,
        nameDoctor,
        registryNumber,
      } = response.data[0];

      const itemsText = response.data
        .map(
          (item, index) => `
        ${index + 1}. ${item.description}
          - Quantidade: ${item.quantity}
          - Posologia: ${item.dosage}
          ${item.observation}
      `
        )
        .join("\n\n");

      const certificateText = generatePrescription(
        namePatient,
        street,
        number,
        district,
        city,
        state,
        date,
        nameDoctor,
        registryNumber,
        itemsText
      );

      setMessageModal(certificateText);
      setErrorModalVisible(true);
    }
  };

  const handleDownloadShift = async () => {
    switch (type) {
      case 1:
        downloadCertificate();
        break;
      case 2:
        downloadExam();
        break;
      case 3:
        downloadPrescription();
        break;
      default:
        setMessageModal(SELECT_DOCUMENT);
        setErrorModalVisible(true);
        break;
    }
  };

  const downloadCertificate = async () => {
    const response = await apiGet<CertificateShow>(
      `/Certificate/id/${documentId}`
    );
    if (response.data !== null) {
      const certificateText = generateMedicalCertificate(
        response.data.name,
        response.data.cpf,
        response.data.days,
        response.data.cid,
        response.data.nameDoctor,
        response.data.crm,
        response.data.cityDescription
      );
      downloadAndOpenDocument(certificateText, "atestado-medico.doc");
    }
  };

  const downloadExam = async () => {
    const response = await apiGet<ExamShow>(`/Exam/document/${documentId}`);
    if (response.data !== null) {
      const examText = generateExam(
        response.data.namePatient,
        response.data.age,
        response.data.gender,
        response.data.date,
        response.data.description,
        response.data.justification,
        response.data.nameDoctor,
        response.data.registryNumber
      );
      downloadAndOpenDocument(examText, "requisição-exame-medico.doc");
    }
  };

  const downloadPrescription = async () => {
    const response = await apiGet<PrescriptionShow[]>(
      `/Prescription/documentId/${documentId}`
    );

    if (response.data !== null && response.data.length > 0) {
      const {
        namePatient,
        street,
        number,
        district,
        date,
        city,
        state,
        nameDoctor,
        registryNumber,
      } = response.data[0];

      const itemsText = response.data
        .map(
          (item, index) => `
        ${index + 1}. ${item.description}
          - Quantidade: ${item.quantity}
          - Posologia: ${item.dosage}
          ${item.observation}
      `
        )
        .join("\n\n");

      const prescriptionText = generatePrescription(
        namePatient,
        street,
        number,
        district,
        city,
        state,
        date,
        nameDoctor,
        registryNumber,
        itemsText
      );

      downloadAndOpenDocument(prescriptionText, "receita-medica-medico.doc");
    }
  };

  const handleDeletetShift = async () => {
    if (selectedDocument && selectedDocument.id) {
      try {
        switch (type) {
          case 1:
            await apiDelete(`/Certificate/${selectedDocument.id}`);
            break;
          case 2:
            await apiDelete(`/Exam/${selectedDocument.id}`);
            break;
          case 3:
            await apiDelete(`/Medicine/${selectedDocument.id}`);
            await apiDelete(`/Prescription/${selectedDocument.id}`);
            break;
          default:
            setMessageModal(SELECT_INVOICE_VALID);
            setErrorModalVisible(true);
            break;
        }
        console.log("sd");
        await apiDelete(`/Document/${selectedDocument.id}`);
        console.log("'-'");

        selectedDocument.status = 3;
        const updatedDocuments = documents.filter(
          (document) => document.id !== selectedDocument.id
        );
        setDocuments(updatedDocuments);

        if (updatedDocuments.length > 0) {
          const nextIndex =
            (documents.findIndex((c) => c.id === selectedDocument.id) + 1) %
            updatedDocuments.length;
          setSelectedDocument(updatedDocuments[nextIndex]);
        } else {
          setSelectedDocument(null);
        }

        getDocuments();
        setResetSelection(true);
      } catch (error) {
        setMessageModal(ERROR_APPOINTMENT_DELETE);
        setErrorModalVisible(true);
      }
    } else {
      setMessageModal(ANY_APPOINTMENT_DELETE);
      setErrorModalVisible(true);
    }
  };

  useEffect(() => {
    getDocuments();
    getPatients();
  }, []);

  useEffect(() => {
    const loadPatients = async () => {
      try {
        if (patientId !== null && patientId !== 0) {
          const value = await AsyncStorage.getItem(STORAGE_DOCTOR);
          if (value) {
            const doctor: Doctor = JSON.parse(value);
            const response = await apiGet(`/Document/doctor/${doctor.id}`);
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
                type: item.type,
              }));

              setDocuments(formattedDocuments);
            }
          } else {
            setMessageModal(FAIL_STORAGE_DOCTOR);
            setErrorModalVisible(true);
          }
        } else {
          getPatients();
          if (selectedDocument === null) {
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

  const handleCreateDocument = () => {
    router.replace("/home-doctor/document-choose-create");
  };

  const items = [
    {
      text: "Gerar Documento",
      icon: "file-import",
      onPress: handleCreateDocument,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <HeaderPage
        title="Documentos"
        onBackPress={handleBackPress}
        auxiliaryModalPress={handleAuxiliaryModalPress}
      />
      <View style={styles.content}>
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
          <WaitingListPageDocument
            onSelect={handleSelectDocument}
            consultations={documents}
            resetSelection={resetSelection}
          />
        </ScrollView>
        <View style={styles.buttonContainer}>
          <Button onPress={handleViewShift} style={styles.button}>
            VISUALIZAR
          </Button>
          <Button onPress={handleDownloadShift} style={styles.button}>
            BAIXAR
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
    flexDirection: "row", // Alinha os botões em linha
    justifyContent: "space-around", // Espaça os botões uniformemente
    marginTop: 10, // Adiciona margem acima se necessário
  },
  button: {
    marginHorizontal: 5, // Adiciona margem horizontal entre os botões
    flex: 1, // Faz com que os botões ocupem espaço igual
  },
});

export default DocumentsDoctorPage;
