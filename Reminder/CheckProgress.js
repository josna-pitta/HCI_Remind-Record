import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import firestore from '@react-native-firebase/firestore';

const CheckProgress = ({ route }) => {
  const { taskId, taskName } = route.params;
  const [progressData, setProgressData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('taskprogress')
      .doc(taskId)
      .onSnapshot(documentSnapshot => {
        if (documentSnapshot.exists) {
          const data = documentSnapshot.data();
          // Remove the taskId if you don't want to display it
          delete data.taskId; 
          setProgressData(data);
        } else {
          setProgressData({});
        }
        setLoading(false);
      }, err => {
        console.error("Failed to fetch progress:", err);
      });

    return () => unsubscribe();
  }, [taskId]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#0000ff" /></View>;
  }

  const renderProgressData = () => {
    return Object.entries(progressData).map(([timeSlot, status]) => (
      <View key={timeSlot} style={styles.progressItem}>
        <Text style={[styles.timeSlot, styles.textColor]}>{timeSlot}</Text>
        <Text style={[styles.status, status === 'yes' ? styles.statusYes : styles.statusNo]}>
        {status === 'yes' ? '✔️' : '❌'}
      </Text>
      </View>
    ));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Task Progress for {taskName}</Text>
      <View style={styles.progressContainer}>
        {renderProgressData()}
      </View>
    </ScrollView>
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  progressContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  timeSlot: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 10,
  },
  status: {
    fontSize: 16,
  },
  statusYes: {
    fontSize: 16,
    color: 'green', // This sets the tick color to green
  },
  statusNo: {
    fontSize: 16,
    color: 'red', // This sets the cross color to red (if needed)
  },
  textColor: {
    color: 'black', // Set the font color to black
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default CheckProgress;
