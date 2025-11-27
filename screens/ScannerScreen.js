// ------------------------------------------------------
//  SCANNERSCREEN (SUPORTE A TEMA + CALLBACK onScan)
// ------------------------------------------------------

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function ScannerScreen({ navigation, route }) {
  const [scanned, setScanned] = useState(false);

  // callback que o carrinho envia
  const onScan = route.params?.onScan;

  const { theme } = useTheme();

  const handleScan = (data) => {
    setScanned(true);

    if (onScan) {
      onScan(data);
      navigation.goBack();
      return;
    }

    alert("QR Lido: " + data);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.mode === "dark" ? "#121212" : "#E0E0E0", // fundo cinza escuro/light
        },
      ]}
    >
      {scanned && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.button }]}
          onPress={() => setScanned(false)}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
            Escanear novamente
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  button: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
});
