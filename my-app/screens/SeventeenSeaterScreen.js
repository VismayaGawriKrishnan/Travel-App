import { supabase } from "../lib/supabase";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Dropdown } from "react-native-element-dropdown";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function SeventeenSeaterScreen({ navigation }) {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [showPicker, setShowPicker] = useState(false);
const [bookings, setBookings] = useState([]);
  const currentDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-01`;
  const minDateOfMonth = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-01`;
  const maxDateOfMonth = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${new Date(selectedYear, selectedMonth + 1, 0).getDate()}`;

const fetchBookings = useCallback(async () => {
  const { data, error } = await supabase
    .from("vehicle_bookings")
    .select("*")
    .eq("vehicle_type", "17-Seater")
    .eq("booking_status", "Confirmed");

  if (!error) {
    setBookings(data || []);
  }
}, []);

useFocusEffect(
  useCallback(() => {
    fetchBookings();
  }, [fetchBookings])
);
  const markedDates = useMemo(() => {
  const marks = {};

  bookings.forEach((booking) => {
    // Parse as UTC dates to avoid timezone off-by-one issues
    const [startY, startM, startD] = booking.pickup_date.split("-").map(Number);
    const [endY, endM, endD] = booking.return_date.split("-").map(Number);
    const start = new Date(Date.UTC(startY, startM - 1, startD));
    const end = new Date(Date.UTC(endY, endM - 1, endD));

    for (
      let d = new Date(start);
      d <= end;
      d.setUTCDate(d.getUTCDate() + 1)
    ) {
      const dateString =
        d.getUTCFullYear() +
        "-" +
        String(d.getUTCMonth() + 1).padStart(2, "0") +
        "-" +
        String(d.getUTCDate()).padStart(2, "0");

      marks[dateString] = {
        selected: true,
        selectedColor: "#B45A2B",
        selectedTextColor: "#FFFFFF",
      };
    }
  });

  return marks;
}, [bookings]);
  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#D15C2D", "#6B2F17"]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>17 Seater</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: 180,
        }}
      >
        {/* Calendar */}
        <View style={styles.calendarWrapper}>
          <View style={styles.monthYearHeaderContainer}>
            <TouchableOpacity
              style={styles.arrowButton}
              onPress={() => {
                let newMonth = selectedMonth - 1;
                let newYear = selectedYear;
                if (newMonth < 0) {
                  newMonth = 11;
                  newYear = selectedYear - 1;
                }
                setSelectedMonth(newMonth);
                setSelectedYear(newYear);
              }}
            >
              <Feather name="chevron-left" size={24} color="#D15C2D" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.monthYearOverlay}
              onPress={() => setShowPicker(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.monthYearOverlayText}>
                {MONTHS[selectedMonth]} {selectedYear}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.arrowButton}
              onPress={() => {
                let newMonth = selectedMonth + 1;
                let newYear = selectedYear;
                if (newMonth > 11) {
                  newMonth = 0;
                  newYear = selectedYear + 1;
                }
                setSelectedMonth(newMonth);
                setSelectedYear(newYear);
              }}
            >
              <Feather name="chevron-right" size={24} color="#D15C2D" />
            </TouchableOpacity>
          </View>

          <Calendar
            key={currentDate}
            current={currentDate}
            markingType={"simple"}
            markedDates={markedDates}
            enableSwipeMonths={false}
            hideExtraDays={true}
            hideArrows={true}
            renderHeader={() => null}
            theme={{
              backgroundColor: "#F8F1E6",
              calendarBackground: "#F8F1E6",
              dayTextColor: "#6B2F17",
              todayTextColor: "#D15C2D",
              selectedDayBackgroundColor: "#B45A2B",
              selectedDayTextColor: "#FFFFFF",
            }}
            style={{
              borderRadius: 24,
            }}
          />
        </View>

        <Text style={styles.bookedTitle}>Booked Dates</Text>

        {bookings.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate("BookingDetails", { booking: item })
            }
          >
            <LinearGradient
              colors={["#D15C2D", "#D15C2D"]}
              style={styles.bookedCard}
            >
              <View style={{ flex: 1 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bookedDate}>{item.customer_name}</Text>
                  <Text style={styles.bookedRoute}>
                    {item.pickup_location} → {item.drop_location}
                  </Text>
                  <Text style={styles.bookedRoute}>{item.pickup_date}</Text>
                </View>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.booking_status}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Month/Year Picker Modal */}
      <Modal
        visible={showPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Month & Year</Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Feather name="x" size={28} color="#6B2F17" />
              </TouchableOpacity>
            </View>

            <View style={styles.pickerContainer}>
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Month</Text>
              <Dropdown
                  style={styles.picker}
                  data={MONTHS.map((month, index) => ({
                  label: month,
                  value: index,
                }))}
                  labelField="label"
                  valueField="value"
                  value={selectedMonth}
                  onChange={(item) => setSelectedMonth(item.value)}
                  placeholder="Select Month"
                  selectedTextStyle={styles.selectedText}
                  itemTextStyle={styles.itemText}
                  containerStyle={styles.dropdownMenu}
                />
              </View>

              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Year</Text>
                <Dropdown
                  style={styles.picker}
                  data={[2026, 2027, 2028, 2029, 2030].map((year) => ({
                    label: String(year),
                    value: year,
                  }))}
                  labelField="label"
                  valueField="value"
                  value={selectedYear}
                  onChange={(item) => setSelectedYear(item.value)}
                  placeholder="Select Year"
                  selectedTextStyle={styles.selectedText}
                  itemTextStyle={styles.itemText}
                  containerStyle={styles.dropdownMenu}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => setShowPicker(false)}
            >
              <LinearGradient
                colors={["#6B2F17", "#D15C2D"]}
                style={styles.confirmButtonGradient}
              >
                <Text style={styles.confirmButtonText}>Done</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Book Now */}
      <View style={styles.sticky}>
        <TouchableOpacity
          onPress={() => {
           navigation.navigate("TripDetails", {
  vehicleType: "17-Seater",
});
          }}
        >
          <LinearGradient
            colors={["#6B2F17", "#D15C2D"]}
            style={styles.bookNow}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.bookNowText}>Book Now</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF9F3", paddingBottom: 25 },

   picker: {
  height: 55,
  width: "100%",
  backgroundColor: "#FBF6E9",
  borderRadius: 15,
  paddingHorizontal: 15,
},

dropdownMenu: {
  backgroundColor: "#FBF6E9",
  borderRadius: 15,
  elevation: 10,
},

selectedText: {
  color: "#000000",
  fontSize: 16,
},

itemText: {
  color: "#000000",
  fontSize: 16,
},
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 55,
    paddingBottom: 18,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    marginLeft: 10,
  },

  calendarWrapper: {
    marginTop: 11,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.99,
    shadowRadius: 9,
    elevation: 9,
    backgroundColor: "#F8F1E6",
    borderRadius: 24,
    padding: 16,
    width: "92%",
    elevation: 4,
  },

  monthYearOverlay: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  monthYearHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  arrowButton: {
    padding: 8,
  },

  monthYearOverlayText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B2F17",
  },

  bookedTitle: {
    fontSize: 24,
    fontWeight: "700",
    margin: 20,
  },

  bookedCard: {
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
  },

  bookedDate: { color: "#fff", fontSize: 20, fontWeight: "490" },
  bookedRoute: { color: "#F7DBD8" },

  badge: {
    backgroundColor: "#F7DBD8",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  badgeText: {
    color: "#751517",
    fontWeight: "500",
  },

  sticky: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
  },

  bookNow: {
    borderRadius: 16,
    height: 56,

    justifyContent: "center",
    alignItems: "center",
  },
  bookNowText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },

 modalContent: {
  backgroundColor: "#FFF9F3",
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  padding: 24,
  paddingBottom: 40,
  overflow: "visible",
},

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#6B2F17",
  },

  pickerContainer: {
    flexDirection: "row",
   justifyContent: "space-around",
   gap:5,
    marginBottom: 100
},

  pickerColumn: {
    flex: 1,
    alignItems: "center",
  },

  pickerLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B2F17",
    marginBottom: 8,
  },


  confirmButton: {
    marginTop: 16,
},

  confirmButtonGradient: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },

  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
