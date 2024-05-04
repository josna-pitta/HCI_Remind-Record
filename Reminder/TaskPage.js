import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Button } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import firestore from '@react-native-firebase/firestore';
import { useRoute } from '@react-navigation/native';

const TaskPage = () => {
  const route = useRoute();
  const uid = route.params?.uid;
  const [taskName, setTaskName] = useState('');
  const [deadline, setDeadline] = useState(new Date());
  const [frequency, setFrequency] = useState('1');
  const [storeProgress, setStoreProgress] = useState('no');
  const [duration, setDuration] = useState('');
  const [durationUnit, setDurationUnit] = useState('days');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const onChangeDeadline = (event, selectedDate) => {
    const currentDate = selectedDate || deadline;
    setShowDatePicker(Platform.OS === 'ios');
    setShowTimePicker(Platform.OS === 'ios');
    setDeadline(currentDate);
  };

  const saveTask = async () => {
    if (!uid) {
      Alert.alert('Error', 'No user ID found');
      return;
    }

    const taskData = {
      uid,
      taskName,
      deadline: firestore.Timestamp.fromDate(deadline),
      frequency,
      storeProgress,
      ...(storeProgress === 'yes' && { duration, durationUnit }),
    };

    try {
      await firestore().collection('tasks').add(taskData);
      Alert.alert('Success', 'Task saved successfully');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save task');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Task Name</Text>
      <TextInput
        style={styles.input}
        value={taskName}
        onChangeText={setTaskName}
        placeholder="Enter Task Name"
      />

      <Text style={styles.text}>Task Deadline</Text>
      <View style={styles.buttonContainer}>
        <Button title="Select Date" onPress={() => setShowDatePicker(true)} />
      </View>
      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={deadline}
          mode="date"
          is24Hour={true}
          display="default"
          onChange={onChangeDeadline}
        />
      )}

      <View style={styles.buttonContainer}>
        <Button title="Select Time" onPress={() => setShowTimePicker(true)} />
      </View>
      {showTimePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={deadline}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onChangeDeadline}
        />
      )}

      <Text style={styles.text}>Frequency of Notifications</Text>
      <Picker
        selectedValue={frequency}
        style={styles.picker}
        onValueChange={(itemValue) => setFrequency(itemValue)}>
        <Picker.Item label="1" value="1" />
        <Picker.Item label="2" value="2" />
        <Picker.Item label="3" value="3" />
        <Picker.Item label="4" value="4" />
        <Picker.Item label="5" value="5" />
      </Picker>

      <Text style={styles.text}>Do you want to store progress?</Text>
      <View style={styles.radioButtonContainer}>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() => setStoreProgress('yes')}>
          <Text style={styles.radioButtonText}>{storeProgress === 'yes' ? '(X) Yes' : '( ) Yes'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.radioButton}
          onPress={() => setStoreProgress('no')}>
          <Text style={styles.radioButtonText}>{storeProgress === 'no' ? '(X) No' : '( ) No'}</Text>
        </TouchableOpacity>
      </View>

      {storeProgress === 'yes' && (
        <View style={styles.durationContainer}>
          <Text style={styles.text}>Duration</Text>
          <TextInput
            style={styles.input}
            value={duration}
            onChangeText={setDuration}
            placeholder="Enter Duration"
            keyboardType="numeric"
          />
          <Picker
            selectedValue={durationUnit}
            style={styles.unitPicker}
            onValueChange={(itemValue) => setDurationUnit(itemValue)}>
            <Picker.Item label="Days" value="days" />
            <Picker.Item label="Weeks" value="weeks" />
            <Picker.Item label="Hours" value="hours" />
            <Picker.Item label="Months" value="months" />
          </Picker>
        </View>
      )}

      <TouchableOpacity style={styles.saveButton} onPress={saveTask}>
        <Text style={styles.saveButtonText}>Save Task</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    padding: 20,
    backgroundColor: '#fff',
  },
  text: {
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    borderColor: '#20B2AA',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginBottom: 8,
    backgroundColor: '20B2AA',
    color: '#333',
  },
  buttonContainer: {
    marginBottom: 8,
  },
  picker: {
    width: '100%',
    marginBottom: 8,
  },
  unitPicker: {
    width: '50%',
    marginBottom: 8,
  },
  radioButtonContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 40,
  },
  radioButtonText: {
    marginLeft: 10,
    fontSize: 18,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#20B2AA',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '50%',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  }
});

export default TaskPage;
