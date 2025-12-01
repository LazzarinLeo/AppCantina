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

export default function SigninScreen({ navigation }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const { login } = useUser();
  const { theme } = useTheme();

  const emailValido = (email) => {
    return (
      email.endsWith("@edu.sc.senai.br") ||
      email.endsWith("@estudante.sesisenai.org.br")
    );
  };

  async function cadastrarUsuario() {
    if (!nome || !email || !senha) {
      Alert.alert("Preencha todos os campos!");
      return;
    }

    if (!emailValido(email)) {
      Alert.alert("Digite um email institucional válido!");
      return;
    }

    try {
      const { data: existingUser } = await supabase
        .from("usuarios")
        .select("*")
        .eq("email", email);

      if (existingUser.length > 0) {
        Alert.alert("Email já cadastrado!");
        return;
      }

      const isAdmin = email.endsWith("@edu.sc.senai.br");


      const salt = bcrypt.genSaltSync(10);
      const senhaHash = bcrypt.hashSync(senha, salt);

      const { data, error } = await supabase
        .from("usuarios")
        .insert([{ nome, email, senha: senhaHash, admin: isAdmin }])
        .select()
        .single();

      if (error) {
        Alert.alert("Erro ao cadastrar", error.message);
        return;
      }

      await supabase.from("carteiras").insert([{ usuario_id: data.id }]);

      login(data);
      Alert.alert("Usuário cadastrado com sucesso!");
      navigation.navigate("Home");
    } catch (err) {
      Alert.alert("Erro inesperado", err.message);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Cadastro</Text>

      <TextInput
        placeholder="Nome"
        value={nome}
        onChangeText={setNome}
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
        placeholder="Email institucional"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
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
        onPress={cadastrarUsuario}
      >
        <Text style={[styles.buttonText, { color: theme.colors.buttonText }]}>
          Cadastrar
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={[styles.link, { color: theme.colors.link }]}>
          Já tem conta?{" "}
          <Text style={[styles.highlight, { color: theme.colors.highlight }]}>
            Faça login
          </Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 30 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 30 },
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
