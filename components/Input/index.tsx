import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors } from '../../constants/colors';

interface InputProps extends TextInputProps {
  label: string;
}

export default function Input({ label, ...rest }: InputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...rest}
        style={[styles.input, rest.style]}
        placeholderTextColor={colors.gray_3}
        textAlignVertical="center"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },

  label: {
    color: colors.white,
    fontSize: 14,
    marginBottom: 5,
    fontFamily: 'PoppinsRegular',
  },

  input: {
    backgroundColor: colors.gray_2,
    color: colors.white,
    fontSize: 14,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 5,
    borderColor: colors.white,
    borderWidth: 2,
    fontFamily: 'PoppinsRegular',
    height: 40,
  },
});
