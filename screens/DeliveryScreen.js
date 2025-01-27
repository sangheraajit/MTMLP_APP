
import React, {useEffect, useRef, useState} from 'react';

import {
  Alert,
  Button,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import QRCodeScanner from 'react-native-qrcode-scanner';

import {Dropdown} from 'react-native-element-dropdown';
import axios from 'axios';

function DeliveryScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const [fileId, setFileId] = useState('');
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [schoolCode, setSchoolCode] = useState('');
  const [userName, setUserName] = useState('');
  const [boxNo, setBoxNo] = useState('');
  const [boxes, setBoxes] = useState([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  useEffect(() => {
    // Fetch File ID on component mount
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
          const fetchedFileId = response.data.Data[0];
          setFileId(fetchedFileId);
          fetchDistricts(fetchedFileId); // Fetch districts after file ID
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch File ID.');
      }
    };
    fetchFileId();
  }, []);

  const fetchDistricts = async fileId => {
    try {
      const response = await axios.get(
        `http://116.72.230.95:99/api/MTMLP/Get_District?FileId=${fileId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );
      if (response.data.Status === 302) {
        setDistricts(response.data.Data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch districts.');
    }
  };
  useEffect(() => {
    if (selectedDistrict) {
      fetchBranches(); // Call fetchBranches whenever selectedDistrict changes
    }
  }, [selectedDistrict]);
  const fetchBranches = async () => {
    if (!fileId || !selectedDistrict) {
      console.warn('File ID or selected district is missing');
      return;
    }

    try {
      const response = await axios.get(
        `http://116.72.230.95:99/api/MTMLP/Get_Branches?FileId=${fileId}&District=${selectedDistrict}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );
      if (response.data.Status === 302) {
        setBranches(response.data.Data);
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
  const fetchBoxes = async () => {
    if (!fileId || !selectedBranch) {
      console.warn('File ID or selected branch is missing');
      return;
    }

    try {
      const response = await axios.get(
        `http://116.72.230.95:99/api/MTMLP/GET_BOXES_FOR_BRANCH?FileId=${fileId}&District=${selectedDistrict}&BrachCode=${selectedBranch}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );
      if (response.data.Status === 302) {
        setBoxes(response.data.Data);
      }
    } catch (error) {
      console.error('Error fetching boxes:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateDelivery = async () => {
    if (
      !fileId ||
      !selectedDistrict ||
      !selectedBranch ||
      !boxNo ||
      !userName
    ) {
      Alert.alert('Validation Error', 'Please fill in all fields.');
      return;
    }

    try {
      const response = await axios.get(
        `http://116.72.230.95:99/api/MTMLP/VALIDATE_DELIVERY?FileId=${fileId}&District=${selectedDistrict}&BrachCode=${selectedBranch}&BOxNo=${boxNo}&UserName=${userName}`,
      );
      if (response.data == 'SUCCESS') {
        setSelectedDistrict('');
        setSelectedBranch('');
      } else {
        Alert.alert('Success', response.data.Message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to validate delivery.');
    }
  };

  const onScanSuccess = e => {
    setBoxNo(e.data);
    setIsScannerOpen(false);
    validateDelivery();
  };
  const renderItem = ({item}) => {
    // Conditionally apply background color based on "DeliveredOn"
    const itemStyle = item.DeliveredOn
      ? styles.deliveredItem
      : styles.notDeliveredItem;

    return (
      <View style={[styles.row, itemStyle]}>
        <Text style={styles.cell}>{item.BoxNo}</Text>
        <Text style={styles.cell}>{item.DeliveredOn || 'Not Delivered'}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        {/*  <Header /> */}
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Text style={styles.label}>File ID: {fileId}</Text>
          <Text style={styles.label}>District:</Text>
          <Dropdown
            data={districts.map(district => ({
              label: district,
              value: district,
            }))}
            labelField="label"
            valueField="value"
            placeholder="Select District"
            value={selectedDistrict}
            onChange={item => {
              setSelectedDistrict(item.value);
            }}
            style={styles.dropdown}
          />
          <Text style={styles.label}>School:</Text>
          <Dropdown
            data={branches.map(branch => ({
              label: branch.Branch,
              value: branch.BranchCode, // Corrected
            }))}
            labelField="label"
            valueField="value"
            placeholder="Select School"
            value={selectedBranch}
            onChange={item => {
              setSelectedBranch(item.value);
              setSchoolCode(item.value);
              //fetchBoxes();
            }}
            style={styles.dropdown}
          />

          <Text style={styles.label}>School Code: {schoolCode}</Text>

          <Text style={styles.label}>Username:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Username"
            value={userName}
            onChangeText={setUserName}
          />
          <Text style={styles.label}>Box No:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Box No"
            value={boxNo}
            onChangeText={setBoxNo}
          />
          <Button
            title="Scan & Submit"
            onPress={() => setIsScannerOpen(true)}
          />
          <Modal
            visible={isScannerOpen}
            animationType="slide"
            onBackdropPress={() => setIsScannerOpen(false)} // Close on outside press
            style={styles.modal}>
            <View style={styles.scannerContainer}>
              <Text style={styles.modalTitle}>Scan QR Code</Text>
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
            </View>
          </Modal>
          <View style={styles.tableContainer}>
            {/* Table Header */}
            <View style={styles.headerRow}>
              <Text style={[styles.cell, styles.header]}>Box No</Text>
              <Text style={[styles.cell, styles.header]}>Delivered On</Text>
            </View>

            {/* Scrollable Table Rows */}
            <ScrollView style={styles.scrollableTable}>
              <FlatList
                data={boxes}
                keyExtractor={item => item.BoxNo.toString()}
                renderItem={renderItem}
                ListEmptyComponent={<Text>No boxes available</Text>}
                showsVerticalScrollIndicator={true}
              />
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10,
    marginLeft: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginHorizontal: 10,
    marginTop: 5,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
  },
  dropdown: {
    height: 50,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    marginVertical: 10,
    marginHorizontal: 10,
    paddingHorizontal: 10,
  },
  boxItem: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 5,
    marginHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
  },
  camera: {
    flex: 1,
  },
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dim background for focus
  },
  scannerContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    height: '80%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  instruction: {
    textAlign: 'center',
    marginVertical: 10,
    color: '#555',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  tableContainer: {
    height: 500, // Fixed height for the scrollable table
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    backgroundColor: '#f5f5f5',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 10,
  },
  cell: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 16,
    textAlign: 'left',
  },
  header: {
    fontWeight: 'bold',
  },
  deliveredItem: {
    backgroundColor: 'green', // Green background if DeliveredOn exists
  },
  notDeliveredItem: {
    backgroundColor: 'white', // Default background if DeliveredOn is empty
  },
  scrollableTable: {
    maxHeight: 200, // Fixed height for the scrollable table content
  },
});

export default DeliveryScreen;
