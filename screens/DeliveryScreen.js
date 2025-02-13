import React, {useEffect, useState} from 'react';
import {
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  useColorScheme,
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
import {Dropdown} from 'react-native-paper-dropdown';

function DeliveryScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const theme = useTheme(); // Get theme colors dynamically
  const [fileIds, setFileIds] = useState('');
  const [selectedFileId, setSelectedFFileId] = useState('');
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [userName, setUserName] = useState('');
  const [boxNo, setBoxNo] = useState('');
  const [boxes, setBoxes] = useState([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);
  const [loading, setLoading] = useState(true);
  const [schoolCode, setSchoolCode] = useState('');
  const dropdownTheme = {
    colors: {
      primary: isDarkMode ? '#BB86FC' : '#6200EE', // Adjust the primary color
      background: isDarkMode ? '#121212' : '#fff',
      surface: isDarkMode ? '#121212' : '#fff',
      text: isDarkMode ? '#fff' : '#000', // Ensures text is visible
      placeholder: isDarkMode ? '#BBBBBB' : '#757575',
    },
  };
  const itemsPerPage = 5; // Set how many items to show per page

  const [page, setPage] = useState(0);

  // Calculate the start and end index of visible items
  const startIndex = page * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const visibleData = boxes?.slice(startIndex, endIndex);
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
          setFileIds(
            response.data.Data.map((file, index) => ({
              label: file,
              value: file, // Ensure value is unique
              key: `file-${index}`, // Unique key
            })),
          );
          const fetchedFileId = response.data.Data[0];
          setSelectedFFileId(fetchedFileId);
          // setFileId(fetchedFileId);
          fetchDistricts(fetchedFileId); // Fetch districts after file ID
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch File ID.');
      }
    };
    fetchFileId();
  }, [selectedFileId]);

  const fetchDistricts = async fileId => {
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
    if (selectedDistrict) {
      fetchBranches(); // Call fetchBranches whenever selectedDistrict changes
    }
  }, [selectedDistrict]);
  const fetchBranches = async () => {
    setBoxes([]);
    console.log('visibleData', boxes);
    if (!fileId || !selectedDistrict) {
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
    if (boxNo) {
      validateDelivery(); // Call fetchBoxes whenever selectedBranch changes
    }
  }, [boxNo]);
  const fetchBoxes = async () => {
    if (!fileId || !selectedBranch) {
      console.warn('File ID or selected branch is missing');
      return;
    }

    try {
      const response = await axios.get(
        `http://116.72.230.95:99/api/MTMLP/GET_BOXES_FOR_BRANCH?FileId=${selectedFileId}&District=${selectedDistrict}&BrachCode=${selectedBranch}`,
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
    if (!fileId || !selectedDistrict || !selectedBranch || !userName) {
      Alert.alert('Validation Error', 'Please fill in all fields.');
      return;
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
          setSelectedDistrict('');
          setSelectedBranch('');
          setUserName('');
          setBoxNo('');
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

  return (
    <PaperProvider>
      <SafeAreaView
        style={[styles.container, isDarkMode && styles.darkContainer]}>
        <Text variant="titleLarge" style={styles.title}>
          Dilivery Screen
        </Text>
        <View style={styles.form}>
          <Text style={{fontSize: 16, fontWeight: 'bold'}}>
            File ID: {selectedFileId}
          </Text>
          <Dropdown
            label="file"
            placeholder="Select field"
            options={fileIds}
            value={selectedFileId}
            onSelect={setFileIds}
            theme={dropdownTheme}
            style={{marginBottom: 15, paddingVertical: 5}} // Add spacing
          />

          {/* District Dropdown */}

          <Dropdown
            label="District"
            placeholder="Select District"
            options={districts}
            value={selectedDistrict}
            onSelect={setSelectedDistrict}
            theme={dropdownTheme}
            style={{marginBottom: 15, paddingVertical: 5}} // Add spacing
          />

          {/* Branch Dropdown */}
          <Dropdown
            label="Branch"
            placeholder="Select Branch"
            options={branches}
            value={selectedBranch}
            onSelect={setSelectedBranch}
            theme={dropdownTheme}
            style={{marginBottom: 10, paddingVertical: 5}} // Add spacing
          />

          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              marginBottom: 10,
              marginTop: 10,
            }}>
            School Code: {selectedBranch}
          </Text>
          <TextInput
            label="Enter Username"
            value={userName}
            onChangeText={setUserName}
            mode="outlined"
            style={styles.input}
          />
          <Text style={{fontSize: 16, fontWeight: 'bold', marginBottom: 10}}>
            Box No: {boxNo}
          </Text>
          <Button
            mode="contained"
            style={{paddingTop: 5, marginTop: 10}} // Add marginTop for spacing
            onPress={() => {
              setBoxNo('');
              setIsScannerOpen(true);
            }}>
            Scan & Submit
          </Button>
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
                  value={boxNo}
                  onChangeText={setBoxNo}
                  mode="outlined"
                  style={styles.input}
                />
              )}

              <View style={styles.buttonContainer}>
                {manualEntry && (
                  <Button mode="contained" onPress={validateDelivery}>
                    Submit
                  </Button>
                )}
                <Button
                  mode="outlined"
                  onPress={() => {
                    setManualEntry(true);
                    setIsScannerOpen(false);
                  }}>
                  Cancel
                </Button>
              </View>
            </View>
          </Modal>
        </Portal>

        <DataTable>
          {/* Table Header */}
          <DataTable.Header>
            <DataTable.Title>Box No</DataTable.Title>
            <DataTable.Title>Status</DataTable.Title>
          </DataTable.Header>

          {/* Table Rows with Conditional Background */}
          {visibleData.map(item => {
            const isDelivered = !!item.DeliveredOn;
            const backgroundColor = isDelivered
              ? '#d4edda'
              : theme.colors.background; // Green for delivered, theme background otherwise
            const textColor = isDelivered ? '#000' : theme.colors.text; // Black on green, theme text otherwise

            return (
              <DataTable.Row
                key={item.BoxNo.toString()}
                style={{backgroundColor}}>
                <DataTable.Cell textStyle={{color: textColor}}>
                  {item.BoxNo}
                </DataTable.Cell>
                <DataTable.Cell textStyle={{color: textColor}}>
                  {item.DeliveredOn || 'Not Delivered'}
                </DataTable.Cell>
              </DataTable.Row>
            );
          })}

          {/* Pagination Controls */}
          <DataTable.Pagination
            page={page}
            numberOfPages={Math.ceil(boxes.length / itemsPerPage)}
            onPageChange={newPage => setPage(Math.max(0, newPage))} // Ensure page doesn't go negative
            label={`${startIndex + 1}-${Math.min(endIndex, boxes.length)} of ${
              boxes.length
            }`}
          />
        </DataTable>
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,

    backgroundColor: '#ffffff',
  },
  darkContainer: {flex: 1, padding: 20, backgroundColor: '#121212'},
  label: {fontSize: 16, fontWeight: 'bold', marginBottom: 5},
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  darkText: {color: '#fff'},
  input: {marginBottom: 10},
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalContainer: {flex: 1, justifyContent: 'center', padding: 20},
});

export default DeliveryScreen;
