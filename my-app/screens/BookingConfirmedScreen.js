import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const BookingConfirmedScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Blurred background overlay */}
      <BlurView intensity={40} tint="dark" style={styles.blurOverlay} />

      {/* Centered dialog box */}
      <View style={styles.dialogBox}>
        {/* Tick icon placeholder (replace with actual image if needed) */}
        <View style={styles.tickCircle}>
          <Image
            source={require('../assets/check.png')}
            style={styles.checkImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.confirmedText}>Booking Confirmed</Text>
       <TouchableOpacity
  onPress={() => navigation.navigate('OwnerHomeScreen')}
  style={{ width: '100%' }}
>
  <LinearGradient
    colors={["#6B2F17", "#D15C2D"]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={styles.button}
  >
    <Text style={styles.buttonText}>Go to Home Page</Text>
  </LinearGradient>
</TouchableOpacity>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    // You can use expo-blur or react-native-blur for actual blur effect
  },
  dialogBox: {
    width: width * 0.8,
    minHeight: height * 0.35,
    backgroundColor: '#F9F7F2',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },

  checkImage: { top: -76,
    width: 84,
    height: 84,
  },
  confirmedText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 32,
    marginTop: -40,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    backgroundColor: '#B85C2E',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default BookingConfirmedScreen;