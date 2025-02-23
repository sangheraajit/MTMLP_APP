import React, { useState } from "react";
import { View, Text, StyleSheet, useColorScheme } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import AntDesign from "react-native-vector-icons/AntDesign"; // Import icons

export default function SearchableDropdown({ 
  label, 
  options, 
  selectedValue, 
  setSelectedValue 
}) {
  const [isFocus, setIsFocus] = useState(false);
  const colorScheme = useColorScheme(); // Detect Light or Dark mode
  const isDarkMode = colorScheme === "dark";

  // Colors based on theme
  const backgroundColor = isDarkMode ? "#222" : "#fff";
  const textColor = isDarkMode ? "#fff" : "#000";
  const borderColor = isFocus ? (isDarkMode ? "#66b2ff" : "blue") : (isDarkMode ? "#555" : "gray");

  const renderLabel = () => {
    if (selectedValue || isFocus) {
      return (
        <Text style={[styles.label, isFocus && { color: 'blue' }]}>
          {label}
        </Text>
      );
    }
    return null;
  };

  // Render dropdown items with a checkmark for the selected one
  const renderItem = (item) => (
    <View style={styles.item}>
      <Text style={[styles.textItem, { color: textColor }]}>{item.label}</Text>
      {item.value === selectedValue && (
        <AntDesign style={styles.icon} name="check" size={20} color={textColor} />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
         {renderLabel()}
      <Dropdown
        style={[styles.dropdown, { backgroundColor, borderColor }]}
        placeholderStyle={[styles.placeholderStyle, { color: textColor }]}
        selectedTextStyle={[styles.selectedTextStyle, { color: textColor }]}
        inputSearchStyle={[styles.inputSearchStyle, { color: textColor, backgroundColor: isDarkMode ? "#333" : "#fff" }]}
        data={options} // Pass options dynamically
        search // Enable search
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={`Select ${label}`} // Dynamic label
        searchPlaceholder="Search..."
        value={selectedValue} // Bind selected value
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={(item) => {
          setSelectedValue(item.value);
          setIsFocus(false);
        }}
        renderItem={renderItem} // Render custom items
        renderLeftIcon={() => (
          <AntDesign style={styles.icon} name="Safety" size={20} color={textColor} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  dropdown: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    borderRadius: 5,
    paddingHorizontal: 8,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  textItem: {
    fontSize: 16,
  },
  icon: {
    marginRight: 5,
  },
});
