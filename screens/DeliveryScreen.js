import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  useColorScheme,
  PermissionsAndroid
} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import axios from 'axios';
import {
  Button,
  TextInput,
  Dialog,
  Portal,
  List,
  Divider,
  Menu,
  PaperProvider,
  Caption,
  Paragraph,
  Subheading,
  Title,
  Headline,
  DataTable,
  useTheme,
} from 'react-native-paper';
import { Dropdown } from 'react-native-paper-dropdown';
import { Dropdown as NewDropdown } from "react-native-element-dropdown";
import SearchableDropdown from '../components/SearchableDropdown';
import BoxTable from '../components/BoxTable';
function DeliveryScreen() {
  const colorScheme = useColorScheme();

  // Dark Mode Styles
  const isDarkMode = colorScheme === "dark";
  const backgroundColor = isDarkMode ? "#222" : "#fff";
  const textColor = isDarkMode ? "#fff" : "#000";
  const borderColor = isFocus ? (isDarkMode ? "#66b2ff" : "blue") : (isDarkMode ? "#555" : "gray");
  const theme = useTheme(); // Get theme colors dynamically
  const [labels, setLabels] = useState([]);
  const [fileIds, setFileIds] = useState([]);
  const [selectedFileId, setSelectedFileId] = useState();
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState();
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState();
  const [userName, setUserName] = useState('');
  const [boxNo, setBoxNo] = useState('');
  const [boxes, setBoxes] = useState([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);
  const [loading, setLoading] = useState(true);
  const [schoolCode, setSchoolCode] = useState('');
  const [gridColumns, setGridColumns] = useState([]);
  const [isFocus, setIsFocus] = useState(false);
  const dropdownTheme = {
    colors: {
      primary: isDarkMode ? '#BB86FC' : '#6200EE', // Adjust the primary color
      background: isDarkMode ? '#121212' : '#fff',
      surface: isDarkMode ? '#121212' : '#fff',
      text: isDarkMode ? '#fff' : '#000', // Ensures text is visible
      placeholder: isDarkMode ? '#BBBBBB' : '#757575',
    },
  };
  const itemsPerPage = 4; // Set how many items to show per page

  const [page, setPage] = useState(0);

  // Calculate the start and end index of visible items
  const startIndex = page * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const visibleData = boxes?.slice(startIndex, endIndex);
  const [simCards, setSimCards] = useState([]);
  useEffect(() => {
    const getSimDetails = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE
          );

          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            const simData = await SimCardsManager.getSimCards();
            if (simData.length > 0) {
              setSimCards(simData);
              setUserName(simData[0].phoneNumber || 'Number Not Available');
            } else {
              Alert.alert('No SIM cards detected');
            }
          } else {
            Alert.alert('Permission Denied', 'Cannot access SIM data.');
          }
        } catch (error) {
          console.error('Error fetching SIM info:', error);
        }
      } else {
        Alert.alert('Not supported on iOS');
      }
    };

    //getSimDetails();
  }, []);

  useEffect(() => {
    const fetchLabels = async () => {
      try {
        const response = await axios.get(
          'http://116.72.230.95:99/api/MTMLP/Get_Labels',
          {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          },
        );

        if (response.data.Status === 302) {
          console.log("fetchLabels response", response.data);



          setLabels(response.data.Data);
          console.log("fetchLabels label", response.data.Data);


        }
      } catch (error) {
        console.error('Failed to fetch label', error);
        Alert.alert('Error', 'Failed to fetch label.');
      }
    };

    fetchLabels();
  }, []);

  useEffect(() => {
    const fetchFileId = async () => {
      try {
        const response = await axios.get(
          'http://116.72.230.95:99/api/MTMLP/Get_FileId',
          {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          },
        );

        if (response.data.Status === 302) {
          console.log("response", response.data);

          const newFileIds = response.data.Data.map((file, index) => ({
            label: file,
            value: file,
            key: `file-${index}`,
          }));

          setFileIds(newFileIds);
          console.log("Updated fileIds", newFileIds);

          if (newFileIds.length > 0) {
            setSelectedFileId(newFileIds[0].value); // Select first item by default
          }
        }
      } catch (error) {
        console.error('Failed to fetch File ID', error);
        Alert.alert('Error', 'Failed to fetch File ID.');
      }
    };

    fetchFileId();
  }, []);


  const fetchDistricts = async () => {
    setDistricts([]);
    setBranches([]);
    setBoxes([]);
    try {
      const response = await axios.get(
        `http://116.72.230.95:99/api/MTMLP/Get_District?FileId=${selectedFileId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );
      if (response.data.Status === 302) {
        setDistricts(
          response.data.Data.map((district, index) => ({
            label: district,
            value: district, // Ensure value is unique
            key: `district-${index}`, // Unique key
          })),
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch districts.');
    }
  };
  useEffect(() => {
    if (selectedFileId) {
      fetchDistricts(selectedFileId);
    }
  }, [selectedFileId]);



  useEffect(() => {
    if (selectedDistrict) {
      fetchBranches(selectedFileId, selectedDistrict);
    }
  }, [selectedDistrict]);
  const fetchBranches = async () => {
    setBoxes([]);
    console.log('visibleData', boxes);
    if (!selectedFileId || !selectedDistrict) {
      console.warn('File ID or selected district is missing');
      return;
    }

    try {
      const response = await axios.get(
        `http://116.72.230.95:99/api/MTMLP/Get_Branches?FileId=${selectedFileId}&District=${selectedDistrict}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );
      if (response.data.Status === 302) {
        console.log("fetchBranches", response.data);
        setBranches(
          response.data.Data.map((branch, index) => ({
            label: branch.Branch, // Display name
            value: branch.BranchCode, // Unique value
            key: `branch-${index}`, // Unique key
          })),
        );
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  useEffect(() => {
    if (selectedBranch) {
      fetchBoxes(); // Call fetchBoxes whenever selectedBranch changes
    }
  }, [selectedBranch]);
  useEffect(() => {
    if (boxNo && !manualEntry) {
      validateDelivery(); // Call fetchBoxes whenever selectedBranch changes
    }
  }, [boxNo]);
  const fetchBoxes = async () => {
    if (!selectedFileId || !selectedBranch) {
      console.warn('File ID or selected branch is missing');
      return;
    }

    try {
      const url = `http://116.72.230.95:99/api/MTMLP/GET_BOXES_FOR_BRANCH?FileId=${selectedFileId}&District=${selectedDistrict}&BrachCode=${selectedBranch}`
      console.log("fetchBoxes url", url);
      const response = await axios.get(url,
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );
      if (response.data.Status === 302) {
        console.log("fetchBoxes", response.data);
        setGridColumns(response.data.Data.Columns)
        setBoxes(response.data.Data.GridData);
      }
    } catch (error) {
      console.error('Error fetching boxes:', error);
    } finally {
      setLoading(false);
    }
  };
  const validateDelivery = async () => {
    if (!selectedFileId || !selectedDistrict || !selectedBranch) {
      Alert.alert('Validation Error', 'Please fill in all fields.');
      return;
    }
    if (!userName) {
      setUserName('')
    }

    const url = `http://116.72.230.95:99/api/MTMLP/VALIDATE_DELIVERY?FileId=${selectedFileId}&District=${selectedDistrict}&BrachCode=${selectedBranch}&BOxNo=${boxNo}&UserName=${userName}`;
    console.log('url', url);

    try {
      const response = await axios.get(url);
      console.log('response', response);

      if (response.data.Data && response.data.Data.length > 0) {
        const message = response.data.Data[0];

        // Split the message by ',' and join with '\n' for new lines
        const formattedMessage = message.split(',').join('\n');

        if (message.includes('SUCCESS')) {
          await fetchBoxes();
          // Check if all boxes are delivered (DeliveredOn is NOT null for all)
          const allDelivered = boxes.every(box => box.DeliveredOn !== null);

          /*   if (allDelivered) {
              setSelectedDistrict('');
              setSelectedBranch('');
              setUserName('');
              setBoxNo('');
            } */
          Alert.alert('Success', formattedMessage);
        } else {
          Alert.alert(`Box No ${boxNo}`, formattedMessage);
          setBoxNo('');
        }
      } else {
        Alert.alert('Error', 'Unexpected response format.');
      }
    } catch (error) {
      Alert.alert('Error', `Failed to validate delivery. ${error.message}`);
    }
  };

  const onScanSuccess = e => {
    setBoxNo(e.data);
    //Alert.alert('test', e.data);
    // Alert.alert('test 1', boxNo);

    //validateDelivery();
    setIsScannerOpen(false);
  };
  const onManualSubmit = async () => {
    setManualEntry(false)
    validateDelivery();
  }
  const renderItem = (item, selectedValue) => {
    return (
      <View style={styles.item}>
        <Text style={styles.textItem}>{item.label}</Text>
        {item.value === value && (
          <AntDesign
            style={styles.icon}
            color="black"
            name="Safety"
            size={20}
          />
        )}
      </View>
    );
  };
  return (
    <PaperProvider>
      <SafeAreaView
        style={[styles.container, isDarkMode && styles.darkContainer]}>
        <Text variant="titleLarge" style={styles.title}>
          {labels.ScreenHeading}
        </Text>
        <View style={styles.form}>



          {/* District Dropdown */}


          <SearchableDropdown
            label={`${labels.Dropdown1}`}
            options={fileIds ?? []} // Pass the correct data array
            selectedValue={selectedFileId}
            setSelectedValue={setSelectedFileId}
          />

          <SearchableDropdown
            label={`${labels.Dropdown2}`}
            options={districts ?? []} // Pass the correct data array
            selectedValue={selectedDistrict}
            setSelectedValue={setSelectedDistrict}
          />
          <SearchableDropdown
            label={`${labels.Dropdown3}`}
            options={branches ?? []} // Pass the correct data array
            selectedValue={selectedBranch}
            setSelectedValue={setSelectedBranch}
          />

          {/* Branch Dropdown */}


          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              marginBottom: 10,
              marginTop: 10,
            }}>
            {labels.LabelText1}: {selectedBranch}
          </Text>
          <TextInput
            label={labels.Textbox_Label}
            value={userName}
            onChangeText={setUserName}
            mode="outlined"
            style={styles.input}
          />
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
            {labels.LabelText2}: {boxNo}
          </Text>
          <Button
            mode="contained"
            style={{ paddingTop: 5, marginTop: 10 }} // Add marginTop for spacing
            onPress={() => {
              setBoxNo('');
              setIsScannerOpen(true);
            }}>
            Scan & Submit
          </Button>
        </View>
        <View style={{ flex: 1, width: "100%", minWidth: "100%" }}>
          <BoxTable
            selectedFileId={selectedFileId}
            selectedDistrict={selectedDistrict}
            selectedBranch={selectedBranch}
          />
        </View>
        <Portal>
          <Modal visible={isScannerOpen} animationType="slide">
            <View
              style={[
                styles.modalContainer,
                isDarkMode && styles.darkContainer,
              ]}>
              {!manualEntry && (
                <QRCodeScanner
                  onRead={onScanSuccess}
                  showMarker={true} // Optional: Show marker rectangle
                  reactivate={true} // Optional: Allow multiple scans
                  reactivateTimeout={3000} // Optional: Time to wait before reactivating
                  topContent={
                    <Text style={styles.instruction}>
                      Align the QR code within the frame
                    </Text>
                  }
                  bottomContent={
                    <Button
                      title="Cancel"
                      onPress={() => setIsScannerOpen(false)}
                    />
                  }
                />
              )}
              <Button onPress={() => setManualEntry(true)}>
                Enter Box No Manually
              </Button>
              {manualEntry && (
                <TextInput
                  label="Enter Box No"
                  keyboardType="numeric" // or "number-pad"
                  value={boxNo}
                  onChangeText={setBoxNo}
                  mode="outlined"
                  style={styles.input}
                />
              )}

              <View style={styles.buttonContainer}>
                {manualEntry && (
                  <Button mode="contained" onPress={onManualSubmit}>
                    Submit
                  </Button>
                )}
                <Button
                  mode="outlined"
                  onPress={() => {
                    setManualEntry(false);
                    setIsScannerOpen(false);
                  }}>
                  Cancel
                </Button>
              </View>
            </View>
          </Modal>
        </Portal>


      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#ffffff',
  },
  darkContainer: { flex: 1, padding: 20, backgroundColor: '#121212' },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 0,
  },
  darkText: { color: '#fff' },
  input: { marginBottom: 10 },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalContainer: { flex: 1, justifyContent: 'center', padding: 20 },
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
});

export default DeliveryScreen;
