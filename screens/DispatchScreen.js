import axios from 'axios';
import React, {useEffect, useState} from 'react';

import {
  Alert,
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
export default function DispatchScreen() {
 
  const [containerNumber, setContainerNumber] = useState('');
  const [fileId, setFileId] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [boxNo, setBoxNo] = useState('');
   const [userName, setUserName] = useState('');
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
          // fetchDistricts(fetchedFileId); // Fetch districts after file ID
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch File ID.');
      }
    };
    fetchFileId();
  }, []);

  const handleSubmit = () => {
    if (field && containerNumber && boxNumber) {
      Alert.alert('Success', 'Data submitted successfully!');
    } else {
      Alert.alert('Error', 'Please fill all fields.');
    }
  };
  const validateDispatch = async () => {
    if (!fileId || !containerNumber) {
      Alert.alert('Validation Error', 'Please fill in all fields.');
      return;
    }

    try {
      const response = await axios.get(
        `http://116.72.230.95:99/api/MTMLP/VALIDATE_DESPATCH?FileId=${fileId}&Containerno=${containerNumber}&BOxNo=${boxNo}&UserName=${userName}`,
      );
      if (response.data == 'SUCCESS') {
        setContainerNumber('');
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
    validateDispatch();
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Delivery Screen</Text>
      <Text style={styles.label}>File ID: {fileId}</Text>

      <TextInput
        style={styles.input}
        placeholder="Container Number"
        value={containerNumber}
        onChangeText={setContainerNumber}
      />

      <Text style={styles.label}>Box No:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Box No"
        value={boxNo}
        onChangeText={setBoxNo}
      />
       <TextInput
                  style={styles.input}
                  placeholder="Enter Username"
                  value={userName}
                  onChangeText={setUserName}
                />
      <Button title="Scan & Submit" onPress={() => setIsScannerOpen(true)} />
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
              <Button title="Cancel" onPress={() => setIsScannerOpen(false)} />
            }
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 15,
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
});
