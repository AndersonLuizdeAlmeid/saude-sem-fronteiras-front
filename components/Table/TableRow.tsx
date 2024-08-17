import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../constants/colors';

interface TableRowProps {
  id: number;
  value: string;
  subValue?: string;
  onPress: (row: any) => void;
  optionTitle?: string;
  showOption?: boolean;
  isFirst: boolean;
  isLast: boolean;
}

export default function TableRow({
  id,
  value,
  subValue,
  onPress,
  optionTitle,
  showOption,
  isFirst,
  isLast,
}: TableRowProps) {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          borderTopEndRadius: isFirst ? 5 : 0,
          borderTopStartRadius: isFirst ? 5 : 0,
          borderBottomEndRadius: isLast ? 5 : 0,
          borderBottomStartRadius: isLast ? 5 : 0,
        },
      ]}
      onPress={() => onPress({ id, value, subValue })}
      activeOpacity={showOption ? 0.2 : 1}
    >
      <View>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.subValue}>{subValue}</Text>
      </View>
      {showOption && (
        <View style={styles.option}>
          <Text style={styles.optionText}>{optionTitle}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',

    borderWidth: 2,
    borderColor: colors.white,

    paddingLeft: 16,
    paddingRight: 16,

    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  value: {
    fontFamily: 'PoppinsBold',
    color: colors.white,
    fontSize: 16,
    marginTop: 7,
  },

  subValue: {
    fontFamily: 'PoppinsBold',
    color: colors.gray_2,
    fontSize: 12,
    marginBottom: 7,
  },

  option: {
    justifyContent: 'center',
  },

  optionText: {
    fontFamily: 'PoppinsRegular',
    color: colors.gray_2,
    fontSize: 12,
  },
});
