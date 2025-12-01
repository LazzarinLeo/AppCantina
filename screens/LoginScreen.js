import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, Alert, StyleSheet } from "react-native";
import { supabase } from "../Services/supabase";
import { useUser } from "../contexts/UserContext";
import { useTheme } from "../contexts/ThemeContext";
import bcrypt from "bcryptjs";

bcrypt.setRandomFallback((len) => {
  const rand = new Uint8Array(len);
  for (let i = 0; i < len; i++) rand[i] = Math.floor(Math.random() * 256);
  return rand;
});

export default function LoginScreen({ navigation }) {
  const [identificador, setIdentificador] = useState("");
  const [senha, setSenha] = useState("");
  const { login } = useUser();
  const { theme } = useTheme();

  async function fazerLogin() {
    if (!identificador || !senha) {
      Alert.alert("Preencha todos os campos!");
      return;
    }

    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isEmail = emailRegex.test(identificador);
      const { data: user, error } = await supabase
        .from("usuarios")
        .select("*")
        .ilike(isEmail ? "email" : "nome", identificador)
        .single();

      if (error || !user) {
        Alert.alert("Usuário não encontrado!");
        return;
      }

      const senhaCorreta = bcrypt.compareSync(senha, user.senha);

      if (!senhaCorreta) {
        Alert.alert("Senha incorreta!");
        return;
      }

      login(user);
      Alert.alert("Login realizado com sucesso!");
      navigation.navigate("Home");
    } catch (err) {
      Alert.alert("Erro inesperado", err.message);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Cantina Escolar</Text>

      <TextInput
        placeholder="Email ou Nome"
        value={identificador}
        onChangeText={setIdentificador}
        autoCapitalize="none"
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.inputBackground,
            color: theme.colors.text,
            borderColor: theme.colors.border,
          },
        ]}
        placeholderTextColor={theme.colors.placeholder}
      />

      <TextInput
        placeholder="Senha"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.inputBackground,
            color: theme.colors.text,
            borderColor: theme.colors.border,
          },
        ]}
        placeholderTextColor={theme.colors.placeholder}
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.button }]}
        onPress={fazerLogin}
      >
        <Text style={[styles.buttonText, { color: theme.colors.buttonText }]}>
          Entrar
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Signin")}>
        <Text style={[styles.link, { color: theme.colors.link }]}>
          Ainda não tem conta?{" "}
          <Text style={[styles.highlight, { color: theme.colors.highlight }]}>
            Cadastre-se
          </Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 30 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 40 },
  input: {
    width: "100%",
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
    elevation: 3,
  },
  buttonText: { fontSize: 18, fontWeight: "bold" },
  link: { marginTop: 20, textAlign: "center", fontSize: 15 },
  highlight: { fontWeight: "bold" },
});
