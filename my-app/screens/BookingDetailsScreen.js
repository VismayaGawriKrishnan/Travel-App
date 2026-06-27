import { supabase } from "../lib/supabase";
import { Feather } from "@expo/vector-icons";
import DateTimePicker, {
    DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { Dropdown } from "react-native-element-dropdown";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
    Alert,
    Image,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function App({ navigation, route }) {
const booking = route?.params?.booking || {};

const [owner, setOwner] =
  useState(booking.owner_name || "");

const [customerName, setCustomerName] =
  useState(booking.customer_name || "");

const [mobile, setMobile] =
  useState(booking.phone_number || "");

const [address, setAddress] =
  useState(booking.address || "");

const [fromLocation, setFromLocation] =
  useState(booking.pickup_location || "");

const [toLocation, setToLocation] =
  useState(booking.drop_location || "");

// Parse date strings as LOCAL midnight to avoid UTC timezone shift
// (new Date("YYYY-MM-DD") = UTC midnight → shows previous day in IST UTC+5:30)
const parseLocalDateTime = (dateStr, timeStr) => {
  if (!dateStr) return new Date();

  const [y, m, d] = dateStr.split("-").map(Number);

  let hours = 0;
  let minutes = 0;

  if (timeStr) {
    const [h, min] = timeStr.split(":").map(Number);
    hours = h || 0;
    minutes = min || 0;
  }

  return new Date(y, m - 1, d, hours, minutes);
};
const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
const [tripBeginDate, setTripBeginDate] =
  useState(
    parseLocalDateTime(
      booking.pickup_date,
      booking.pickup_time
    )
  );

const [tripEndDate, setTripEndDate] =
  useState(
    parseLocalDateTime(
      booking.return_date,
      booking.return_time
    )
  );


  const vehicleType =
  route?.params?.vehicleType || booking.vehicle_type || "";

  const [showBeginDatePicker, setShowBeginDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleConfirm = async () => {
    // Validate all fields
    if (!owner.trim()) {
      Alert.alert("Required", "Please select an owner");
      return;
    }
    if (!customerName.trim()) {
      Alert.alert("Required", "Please enter customer name");
      return;
    }
    if (!mobile.trim() || mobile.length !== 10) {
      Alert.alert("Required", "Please enter a valid 10-digit mobile number");
      return;
    }
    if (!address.trim()) {
      Alert.alert("Required", "Please enter pickup address");
      return;
    }
    if (!fromLocation.trim()) {
      Alert.alert("Required", "Please enter 'From' location");
      return;
    }
    if (!toLocation.trim()) {
      Alert.alert("Required", "Please enter 'To' location");
      return;
    }
    if (!tripBeginDate) {
      Alert.alert("Required", "Please select trip beginning date and time");
      return;
    }
    if (!tripEndDate) {
      Alert.alert("Required", "Please select trip end date and time");
      return;
    }
// Check if vehicle already booked for selected dates
const startDate = formatLocalDate(tripBeginDate);
const endDate = formatLocalDate(tripEndDate);

const { data: existingBookings, error: checkError } = await supabase
  .from("vehicle_bookings")
  .select("*")
  .eq("vehicle_type", vehicleType)
  .eq("booking_status", "Confirmed");

if (checkError) {
  Alert.alert("Error", checkError.message);
  return;
}

const hasConflict = existingBookings.some(
  (b) => {
    if (b.id === booking.id) return false;

    return (
      startDate <= b.return_date &&
      endDate >= b.pickup_date
    );
  }
);

if (hasConflict) {
  Alert.alert(
    "Vehicle Unavailable",
    "This vehicle is already booked for the selected dates."
  );
  return;
}
const { error } = await supabase
  .from("vehicle_bookings")
.update({
  owner_name: owner,
  customer_name: customerName,
  phone_number: mobile,
  address: address,
  pickup_location: fromLocation,
  drop_location: toLocation,

  pickup_date: formatLocalDate(tripBeginDate),
  return_date: formatLocalDate(tripEndDate),

  pickup_time: tripBeginDate.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }),

  return_time: tripEndDate.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }),
})
  .eq("id", booking.id);

if (error) {
  Alert.alert("Booking Failed", error.message);
  return;
}
    setShowBookingDialog(true);
  };

  const handleDelete = async () => {
    if (!booking.id) {
      Alert.alert("Error", "Booking ID is missing. Cannot delete.");
      return;
    }

    // Soft-delete: mark as Cancelled so the fetch queries
    // (which filter by booking_status = "Confirmed") exclude this booking.
    // This uses the same UPDATE permission that Save Changes relies on.
    const { error } = await supabase
      .from("vehicle_bookings")
      .update({ booking_status: "Cancelled" })
      .eq("id", booking.id);

    if (error) {
      Alert.alert("Delete Failed", error.message);
      return;
    }
    setShowDeleteDialog(false);
    navigation.goBack();
  };

  const showAndroidDateTimePicker = (type) => {
    DateTimePickerAndroid.open({
      value: (type === "begin" ? tripBeginDate : tripEndDate) || new Date(),
      mode: "date",
      onChange: (event, selectedDate) => {
        if (event.type === "set" && selectedDate) {
          DateTimePickerAndroid.open({
            value: selectedDate,
            mode: "time",
            onChange: (timeEvent, selectedTime) => {
              if (timeEvent.type === "set" && selectedTime) {
                const combinedDate = new Date(
                  selectedDate.getFullYear(),
                  selectedDate.getMonth(),
                  selectedDate.getDate(),
                  selectedTime.getHours(),
                  selectedTime.getMinutes(),
                );
                if (type === "begin") {
                  setTripBeginDate(combinedDate);
                } else {
                  setTripEndDate(combinedDate);
                }
              }
            },
          });
        }
      },
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient
        colors={["#D15C2D", "#6B2F17"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trip Details</Text>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Owner */}
      <Text style={styles.label}>Owner Name</Text>

        <View style={styles.inputBox}>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            data={[
              { label: "Owner 1", value: "owner1" },
              { label: "Owner 2", value: "owner2" },
              { label: "Owner 3", value: "owner3" },
              { label: "Owner 4", value: "owner4" },
            ]}
            maxHeight={200}
            labelField="label"
            valueField="value"
            placeholder="Select Owner"
            value={owner}
            onChange={(item) => {
              setOwner(item.value);
            }}
            containerStyle={styles.dropdownContainer}
            itemTextStyle={styles.itemText}
          />
        </View>


        {/* Customer */}
        <Text style={styles.label}>Customer Name</Text>
        <TextInput
          placeholder="Enter Customer Name"
          placeholderTextColor="#B99688"
          style={styles.input}
          value={customerName}
          onChangeText={setCustomerName}
        />

        {/* Mobile */}
        <Text style={styles.label}>Mobile Number</Text>
        <View style={styles.mobileContainer}>
          <Text style={styles.countryCode}>+91</Text>
          <TextInput
            placeholder="Enter Mobile Number"
            placeholderTextColor="#B99688"
            style={styles.mobileInput}
            keyboardType="number-pad"
            value={mobile}
            onChangeText={(text) => {
              if (/^\d*$/.test(text) && text.length <= 10) {
                setMobile(text);
              }
            }}
          />
        </View>

        {/* Address */}
        <Text style={styles.label}>Address</Text>
        <TextInput
          placeholder="Enter Pickup Address"
          placeholderTextColor="#B99688"
          style={[styles.input, { height: 90, textAlignVertical: "top" }]}
          multiline
          value={address}
          onChangeText={setAddress}
        />

        {/* Trip */}
        <Text style={styles.label}>Trip</Text>
        <View style={styles.tripRow}>
          <TextInput
            placeholder="From"
            placeholderTextColor="#B99688"
            style={styles.tripInput}
            value={fromLocation}
            onChangeText={setFromLocation}
          />
          <Feather name="repeat" size={22} color="#D15C2D" />
          <TextInput
            placeholder="To"
            placeholderTextColor="#B99688"
            style={styles.tripInput}
            value={toLocation}
            onChangeText={setToLocation}
          />
        </View>

        {/* Begin Date */}
        <Text style={styles.label}>Trip Beginning</Text>
        <TouchableOpacity
          style={styles.dateBox}
          onPress={() => {
            if (Platform.OS === "android") {
              showAndroidDateTimePicker("begin");
            } else {
              setShowBeginDatePicker(true);
            }
          }}
        >
          <Feather name="calendar" size={20} color="#444" />
          <Text style={styles.dateText}>
            {tripBeginDate
              ? tripBeginDate.toLocaleDateString() +
                " " +
                tripBeginDate.toLocaleTimeString()
              : "Select Date And Time"}
          </Text>
        </TouchableOpacity>

        {showBeginDatePicker && Platform.OS === "ios" && (
          <DateTimePicker
            value={tripBeginDate || new Date()}
            mode="datetime"
            onChange={(event, selectedDate) => {
              setShowBeginDatePicker(false);
              if (selectedDate) {
                setTripBeginDate(selectedDate);
              }
            }}
          />
        )}

        {/* End Date */}
        <Text style={styles.label}>Trip End</Text>
        <TouchableOpacity
          style={styles.dateBox}
          onPress={() => {
            if (Platform.OS === "android") {
              showAndroidDateTimePicker("end");
            } else {
              setShowEndDatePicker(true);
            }
          }}
        >
          <Feather name="calendar" size={20} color="#444" />
          <Text style={styles.dateText}>
            {tripEndDate
              ? tripEndDate.toLocaleDateString() +
                " " +
                tripEndDate.toLocaleTimeString()
              : "Select Date And Time"}
          </Text>
        </TouchableOpacity>

        {showEndDatePicker && Platform.OS === "ios" && (
          <DateTimePicker
            value={tripEndDate || new Date()}
            mode="datetime"
            onChange={(event, selectedDate) => {
              setShowEndDatePicker(false);
              if (selectedDate) {
                setTripEndDate(selectedDate);
              }
            }}
          />
        )}

        {/* Action Buttons Row */}
        <View style={styles.actionRow}>
          {/* Save Changes */}
          <TouchableOpacity
            style={styles.saveButtonWrapper}
            onPress={handleConfirm}
          >
            <LinearGradient
              colors={["#6B2F17", "#D15C2D"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionButton}
            >
           
              <Text style={styles.buttonText}>Update</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Delete Booking */}
          <TouchableOpacity
            style={styles.deleteButtonWrapper}
            onPress={() => setShowDeleteDialog(true)}
          >
            <View style={styles.deleteButton}>
            
              <Text style={styles.deleteButtonText}>Cancel Booking</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Save Success Modal */}
      <Modal
        visible={showBookingDialog}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBookingDialog(false)}
      >
        <View style={styles.modalContainer}>
          <BlurView intensity={100} tint="dark" style={styles.modalBlur} />
          <View style={styles.dialogBox}>
            <View style={styles.tickCircle}>
              <Image
                source={require("../assets/check.png")}
                style={styles.checkImage}
              />
            </View>
            <Text style={styles.confirmedText}>Booking Updated</Text>
            <TouchableOpacity
              style={{ width: "100%" }}
              onPress={() => {
                setShowBookingDialog(false);
                navigation.goBack();
              }}
            >
              <LinearGradient
                colors={["#6B2F17", "#D15C2D"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Go Back</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteDialog}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteDialog(false)}
      >
        <View style={styles.modalContainer}>
          <BlurView intensity={100} tint="dark" style={styles.modalBlur} />
          <View style={styles.dialogBox}>
            {/* Trash icon circle */}
            
            
            
            <Text style={styles.deleteDialogTitle}>Cancel Booking</Text>
            <Text style={styles.deleteDialogSubtitle}>
              Are you sure you want to cancel this booking?
            </Text>
            {/* Buttons */}
            <View style={styles.deleteDialogButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowDeleteDialog(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmDeleteBtnWrapper}
                onPress={handleDelete}
              >
                <LinearGradient
                  colors={["#6B2F17", "#D15C2D"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.confirmDeleteBtn}
                >
                  
                  <Text style={styles.confirmDeleteText}>Confirm</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFF9" },
   dropdown: {
  height: 55,
  paddingHorizontal: 15,
},

placeholderStyle: {
  color: "#B99688",
  fontSize: 16,
},

selectedTextStyle: {
  color: "#000000",
  fontSize: 16,
},

itemText: {
  color: "#000000",
  fontSize: 16,
},

dropdownContainer: {
  backgroundColor: "#FBF6E9",
  borderRadius: 15,
},

  header: {
    paddingTop: 55,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: "row",
    alignItems: "center",
  },

  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "600",
    marginLeft: 10,
  },

  label: {
    fontSize: 18,
    fontWeight: "500",
    marginTop: 20,
    marginHorizontal: 20,
    color: "#000000",
  },

  input: {
    backgroundColor: "#FBF6E9",
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 16,
    color: "#000000",
  },

  inputBox: {
    backgroundColor: "#FBF6E9",
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 15,
    overflow: "hidden",
  },

  mobileContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FBF6E9",
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 15,
    paddingHorizontal: 15,
  },

  countryCode: { fontSize: 16, marginRight: 10, color: "#000000" },

  mobileInput: { flex: 1, fontSize: 16, paddingVertical: 14, color: "#000000" },

  tripRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 10,
  },

  tripInput: {
    backgroundColor: "#FBF6E9",
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 14,
    width: "42%",
    color: "#000000",
  },

  dateBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FBF6E9",
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 16,
  },

  dateText: { marginLeft: 10, fontSize: 16, color: "#B08974" },

  buttonWrapper: { marginHorizontal: 20, marginVertical: 30 },

  button: {
    borderRadius: 19,
    paddingVertical: 16,
    alignItems: "center",
  },

  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  /* Side-by-side action row */
  actionRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 36,
    gap: 12,
  },

  saveButtonWrapper: { flex: 1 },

  actionButton: {
    borderRadius: 16,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  deleteButtonWrapper: { flex: 1 },

  deleteButton: {
    borderRadius: 16,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
backgroundColor: "#fcf9f3ff",
    borderWidth: 1,
    borderColor: "#D15C2D",
  },

  deleteButtonText: {
    color: "#D15C2D",
    fontSize: 16,
    fontWeight: "600",
  },

  /* Modals */
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  modalBlur: { ...StyleSheet.absoluteFillObject },

  dialogBox: {
    width: "85%",
    backgroundColor: "#F9F7F2",
    borderRadius: 32,
    alignItems: "center",
    padding: 28,
    elevation: 8,
  },

  checkImage: { width: 84, height: 84, top: -66 },

  tickCircle: {},

  confirmedText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6B2F17",
    marginTop: -34,
    paddingBottom: 12,
    marginBottom: 20,
  },


  deleteDialogTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#6B2F17",
    marginBottom: 10,
    textAlign: "center",
  },

  deleteDialogSubtitle: {
    fontSize: 15,
    color: "#888",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },

  deleteDialogButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },

  cancelBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor:"#D15C2D",
    backgroundColor: "#fcf9f3ff",
    alignItems: "center",
    justifyContent: "center",
  },

  cancelBtnText: {
    color: "#D15C2D",
    fontSize: 15,
    fontWeight: "600",
  },

  confirmDeleteBtnWrapper: { flex: 1 },

  confirmDeleteBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  confirmDeleteText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
