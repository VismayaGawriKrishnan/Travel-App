import { Feather } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [fontsLoaded] = useFonts({
    "Serpentine-Bold": require("../assets/Serpentine-Bold.ttf"),
  });

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const shakeError = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = async () => {
    setError("");
    if (!email.trim()) {
      setError("Please enter your email address.");
      shakeError();
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      shakeError();
      return;
    }

    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (authError) {
        if (
          authError.message.includes("Invalid login credentials") ||
          authError.message.includes("invalid_credentials")
        ) {
          setError("Incorrect email or password. Please try again.");
        } else if (authError.message.includes("Email not confirmed")) {
          setError("Please verify your email before logging in.");
        } else {
          setError(authError.message);
        }
        shakeError();
        return;
      }

      if (data?.user) {
        navigation.replace("OwnerHomeScreen", { user: data.user });
      }
    } catch (e) {
      setError("Something went wrong. Please try again.");
      shakeError();
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) {
    return (
      <LinearGradient colors={["#D15C2D", "#6B2F17"]} style={styles.loader}>
        <ActivityIndicator size="large" color="#fff" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#D15C2D", "#9B3D1C", "#6B2F17"]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        {/* Logo */}
        <Animated.View
          style={[
            styles.logoWrapper,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Image
            source={require("../assets/logo1.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Card */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { translateX: shakeAnim },
              ],
            },
          ]}
        >
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.subText}>Sign in to your owner account</Text>

          {/* Email Field */}
          <View style={styles.inputWrapper}>
            <Feather name="mail" size={18} color="#D15C2D" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#B0A090"
              value={email}
              onChangeText={(t) => { setEmail(t); setError(""); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password Field */}
          <View style={styles.inputWrapper}>
            <Feather name="lock" size={18} color="#D15C2D" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Password"
              placeholderTextColor="#B0A090"
              value={password}
              onChangeText={(t) => { setPassword(t); setError(""); }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather
                name={showPassword ? "eye-off" : "eye"}
                size={18}
                color="#A08878"
              />
            </TouchableOpacity>
          </View>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorBox}>
              <Feather name="alert-circle" size={14} color="#C0392B" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={loading}
          >
            <LinearGradient
              colors={["#E8702A", "#C04A1A"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loginBtnGradient}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.loginBtnText}>LOGIN</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.hintText}>
            Only registered owners can access this app.
          </Text>
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  logoWrapper: {
    marginBottom: 32,
    alignItems: "center",
  },
  logo: {
    width: 200,
    height: 64,
  },
  card: {
    backgroundColor: "#FFF8F3",
    borderRadius: 28,
    padding: 28,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  welcomeText: {
    fontFamily: "Serpentine-Bold",
    fontSize: 26,
    color: "#3D1A0A",
    marginBottom: 4,
  },
  subText: {
    fontSize: 14,
    color: "#9E7060",
    marginBottom: 28,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF0E6",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#EDCFBE",
    paddingHorizontal: 14,
    marginBottom: 16,
    height: 54,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#3D1A0A",
  },
  eyeBtn: {
    paddingLeft: 8,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDECEA",
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: "#C0392B",
    fontSize: 13,
    flex: 1,
  },
  loginBtn: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 4,
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loginBtnGradient: {
    height: 54,
    justifyContent: "center",
    alignItems: "center",
  },
  loginBtnText: {
    fontFamily: "Serpentine-Bold",
    color: "#fff",
    fontSize: 18,
    letterSpacing: 2,
  },
  hintText: {
    textAlign: "center",
    color: "#B08070",
    fontSize: 12,
    marginTop: 18,
  },
});
