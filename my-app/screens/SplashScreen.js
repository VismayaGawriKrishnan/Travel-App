import { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";
import { supabase } from "../lib/supabase";

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(async () => {
      // Check if an owner is already signed in
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigation.replace("OwnerHomeScreen");
      } else {
        navigation.replace("Login");
      }
    }, 2500); // 2.5 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F1EE",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 240,
    height: 77.27,
  },
});
