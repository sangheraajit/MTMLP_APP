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
} from 'react-native-paper';
import { Dropdown } from 'react-native-paper-dropdown';

function DispatchScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const [containerNumber, setContainerNumber] = useState('');
   const [fileIds, setFileIds] = useState([]);
  const [selectedFileId, setSelectedFileId] = useState();
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [boxNo, setBoxNo] = useState('');
  const [userName, setUserName] = useState('');
  const [manualEntry, setManualEntry] = useState(false);
  const dropdownTheme = {
    colors: {
      primary: isDarkMode ? '#BB86FC' : '#6200EE', // Adjust the primary color
      background: isDarkMode ? '#121212' : '#fff',
      surface: isDarkMode ? '#121212' : '#fff',
      text: isDarkMode ? '#fff' : '#000', // Ensures text is visible
      placeholder: isDarkMode ? '#BBBBBB' : '#757575',
    },
  };
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

  const validateDispatch = async () => {
    if (!selectedFileId || !containerNumber) {
      Alert.alert('Validation Error', 'Please fill in all fields.');
      return;
    }
    const url = `http://116.72.230.95:99/api/MTMLP/VALIDATE_DESPATCH?FileId=${selectedFileId}&Containerno=${containerNumber}&BOxNo=${boxNo}&UserName=${userName}`;
    console.log('url', url);

    try {
      const response = await axios.get(url);
      console.log('response', response);

      if (response.data.Data && response.data.Data.length > 0) {
        const message = response.data.Data[0];

        // Split the message by ',' and join with '\n' for new lines
        const formattedMessage = message.split(',').join('\n');

        if (message.includes('SUCCESS')) {
          //setContainerNumber('');
          //setBoxNo('');
          //setUserName('');
          Alert.alert('Success', formattedMessage);
        } else {
          Alert.alert(`Box No ${boxNo}`, formattedMessage);
          setBoxNo('');
        }
      } else {
        Alert.alert('Error', 'Unexpected response format.');
      }
    } catch (error) {
      Alert.alert('Error', `Failed to validate dispatch. ${error.message}`);
    }
  };

  const onScanSuccess = e => {
    setBoxNo(e.data);
    setIsScannerOpen(false);
    // validateDispatch();
  };
  useEffect(() => {
    if (boxNo && !manualEntry) {
      validateDispatch(); // Call fetchBoxes whenever selectedBranch changes
    }
  }, [boxNo]);
  const onManualSubmit = async () => {
    setManualEntry(false)
    validateDispatch();
  }
  return (
    <PaperProvider>
      <SafeAreaView
        style={[styles.container, isDarkMode && styles.darkContainer]}>
        <View style={styles.container}>
          <Text variant="titleLarge" style={styles.title}>
            Dispatch Screen
          </Text>

          <Dropdown
            label="File ID"

            placeholder="Select File ID"
            options={fileIds ?? []} // Fallback to empty array
            value={selectedFileId}
            onSelect={setSelectedFileId}
            theme={dropdownTheme}
            style={{ marginBottom: 15, paddingVertical: 5 }} // Add spacing
          />
          <TextInput
            label="Container Number"
            mode="outlined"
            value={containerNumber}
            onChangeText={setContainerNumber}
            style={styles.input}
          />

          <TextInput
            label="Enter Username"
            mode="outlined"
            value={userName}
            onChangeText={setUserName}
            style={styles.input}
          />
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
            Box No: {boxNo}
          </Text>
          <Button
            mode="contained"
            onPress={() => setIsScannerOpen(true)}
            style={{paddingTop: 5, marginTop: 10}}
            >
            Scan & Submit
          </Button>

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
        </View>
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
  darkContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#121212',
  },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  darkText: { color: '#fff' },
  input: { marginBottom: 10 },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalContainer: { flex: 1, justifyContent: 'center', padding: 20 },
});
export default DispatchScreen;
