import React, { useState } from "react";
import { StyleSheet, ScrollView, SafeAreaView, Text, View } from "react-native";
import HeaderPage from "../../components/HeaderPage";
import { colors } from "../../constants/colors";
import SelectionModal from "../../components/CustomModal";
import { router } from "expo-router";

const AboutPage: React.FC = () => {
  const [isModalVisible, setModalVisible] = useState(false);

  const handleBackPress = () => {
    router.back();
  };

  const handleAuxiliaryModalPress = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleSelectLabels = (labels: string[]) => {
    console.log("Labels selecionadas:", labels);
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderPage
        title="Tutoriais"
        onBackPress={handleBackPress}
        auxiliaryModalPress={handleAuxiliaryModalPress}
      />

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Bem-vindo ao Sobre</Text>

          <Text style={styles.text}>
            A telemedicina oferece a capacidade de fornecer serviços médicos à
            distância, utilizando ferramentas avançadas de comunicação, como
            videoconferências, mensagens de texto e áudio. Essas tecnologias
            permitem não apenas apoiar, mas em alguns casos, até mesmo
            substituir as necessidades da medicina tradicional. Entre os
            inúmeros benefícios associados à telemedicina, destacam-se a
            facilidade de acesso à saúde para pessoas com limitações de
            mobilidade ou que residem em áreas remotas, a redução de custos em
            comparação com consultas presenciais, e o aumento da segurança em
            períodos de pandemia ou em situações envolvendo doenças
            transmissíveis. Pesquisas realizadas com profissionais da área e
            empresas atuantes nesse mercado reforçam a crescente necessidade de
            ampliar as opções disponíveis para atender às demandas da população
            no que diz respeito à saúde. O objetivo deste aplicativo é aproximar
            médicos e pacientes, tornando os benefícios da telemedicina
            acessíveis a todos, independentemente de classe social, plano de
            saúde ou local de residência.
          </Text>
        </View>
      </ScrollView>
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
    padding: 20,
    alignItems: "flex-start",
  },
  textContainer: {
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: colors.white,
    textAlign: "center",
  },
  text: {
    fontSize: 16,
    marginBottom: 15,
    color: colors.white,
    textAlign: "center",
  },
});

export default AboutPage;
