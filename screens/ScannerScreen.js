
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function ScannerScreen({ navigation, route }) {
  // Controla se já houve leitura (exibe botão de escanear novamente)
  const [scanned, setScanned] = useState(false);

  // Callback opcional enviado pela tela do carrinho
  const onScan = route.params?.onScan;

  // Tema atual (dark/light)
  const { theme } = useTheme();

  // Função chamada quando um QR Code é lido
  const handleScan = (data) => {
    setScanned(true);

    // Se alguma tela enviou o callback onScan,
    // devolve o valor escaneado para ela
    if (onScan) {
      onScan(data);
      navigation.goBack(); // volta automaticamente
      return;
    }

    // Caso NÃO tenha callback, apenas exibe alerta (modo teste)
    alert("QR Lido: " + data);
  };

  return (
    <View
      style={[
        styles.container,
        {
          // Fundo adaptado ao tema
          backgroundColor: theme.mode === "dark" ? "#121212" : "#E0E0E0",
        },
      ]}
    >
      {/* Botão que aparece após a leitura para repetir o processo */}
      {scanned && (
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: theme.colors.button },
          ]}
          onPress={() => setScanned(false)} // reseta o estado
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
  container: {
    flex: 1,
  },

  button: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
});
