import {
  View,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Button from '../Button';
import { colors } from '../../constants/colors';
import { useState } from 'react';

interface ModalSelectProps {
  visible: boolean;
  onHide: () => void;
  data: { id: number; value: string }[];
  onConfirm: (id: number) => void;
}

export function ModalSelect({ onHide, visible, data, onConfirm }: ModalSelectProps) {
  const [selectedID, setSelectedID] = useState<number>(0);

  const handleItemPress = (id: number) => {
    setSelectedID(id);
  };

  const handleConfirm = () => {
    if (!!selectedID) {
      onConfirm(selectedID);
    }
    onHide();
  };
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.container}>
        <View style={styles.modalContent}>
          <ScrollView style={styles.scrollView}>
            {data.map((item, index) => (
              <TouchableOpacity key={index} onPress={() => handleItemPress(item.id)}>
                <Text style={[styles.item, selectedID === item.id && styles.selectedItem]}>
                  {item.value}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Button onPress={handleConfirm} style={{ marginTop: 20 }}>
            CONFIRMAR
          </Button>
          <Button onPress={onHide}>CANCELAR</Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalContent: {
    backgroundColor: colors.gray_1,
    borderWidth: 2,
    borderColor: colors.white,
    borderRadius: 5,
    padding: 20,

    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scrollView: {
    maxHeight: 300,
    width: '90%',
  },

  item: {
    fontSize: 16,
    paddingVertical: 5,
    fontFamily: 'PoppinsRegular',
  },

  selectedItem: {
    color: colors.white,
  },
});
