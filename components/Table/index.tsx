import { DimensionValue, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';
import TableRow from './TableRow';
import React from 'react';

interface Data {
  id: number;
  value: string;
  subValue?: string;
}

interface TableProps {
  title: string;
  data: Data[];
  onClickOption?: (row: any) => void;
  optionTitle?: string;
  showOption?: boolean;
  height?: DimensionValue;
}

export default function Table({
  title,
  data,
  onClickOption,
  optionTitle = 'Editar',
  showOption = true,
  height = '80%',
}: TableProps) {
  return (
    <View style={[styles.container, { height: height }]}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView>
        {data?.map((d, index) => (
          <React.Fragment key={d.id}>
            <TableRow
              {...d}
              onPress={(row) => onClickOption && onClickOption(row)}
              optionTitle={optionTitle}
              showOption={showOption}
              isFirst={index === 0}
              isLast={index === data.length - 1}
            />
          </React.Fragment>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },

  title: {
    fontFamily: 'PoppinsBold',
    color: colors.gray_3,
    fontSize: 12,
    marginBottom: 10,
  },
});
