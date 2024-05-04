import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import firestore from '@react-native-firebase/firestore';

const RecordProgress = ({ route, navigation }) => {
    const { taskId, taskName, duration, durationUnit } = route.params;
    const [selectedInterval, setSelectedInterval] = useState(1);
    const [taskAccomplished, setTaskAccomplished] = useState('no');
  
    const updateTaskProgress = async () => {
      const timeLabel = `${durationUnit.slice(0, -1).toLowerCase()}${selectedInterval}`;
      
      const progressDoc = firestore().collection('taskprogress').doc(taskId);
    
      try {
        await firestore().runTransaction(async (transaction) => {
          const progressSnapshot = await transaction.get(progressDoc);
          const updates = {
            taskId: taskId,                  // Unique identifier for the task
            [timeLabel]: taskAccomplished    // Only "yes" or "no" as the value
          };
          if (progressSnapshot.exists) {
            // If there's already data, merge the new data with the existing document
            transaction.update(progressDoc, updates);
          } else {
            // If no document exists, create a new one with the updates
            transaction.set(progressDoc, updates);
          }
        });
        alert('Task progress updated successfully');
      } catch (error) {
        console.error('Failed to update task progress:', error);
        alert('Failed to update task progress');
      }
    };

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Record Progress for {taskName}</Text>
        <Picker
          selectedValue={selectedInterval}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedInterval(itemValue)}>
          {Array.from({ length: duration }, (_, i) => (
            <Picker.Item key={i} label={`${durationUnit.slice(0, -1)} ${i + 1}`} value={i + 1} />
          ))}
        </Picker>
  
        <Text style={styles.subtitle}>Task Accomplished?</Text>
        <View style={styles.radioContainer}>
          <TouchableOpacity
            style={styles.radioButton}
            onPress={() => setTaskAccomplished('yes')}>
            <Text style={styles.radioText}>{taskAccomplished === 'yes' ? '(●) Yes' : '(○) Yes'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.radioButton}
            onPress={() => setTaskAccomplished('no')}>
            <Text style={styles.radioText}>{taskAccomplished === 'no' ? '(●) No' : '(○) No'}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={updateTaskProgress}>
          <Text style={styles.saveButtonText}>Save Progress</Text>
        </TouchableOpacity>
      </View>
    );
  };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  picker: {
    width: '100%',
    height: 44,
    backgroundColor: '#ffffff',
    borderColor: '#cccccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
  },
  radioContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  radioText: {
    marginLeft: 5,
    fontSize: 18,
  },
  saveButton: {
    backgroundColor: '#20B2AA',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  }
});

export default RecordProgress;
