import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Importing MaterialIcons


const TaskListPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const uid = route.params?.uid;
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const subscriber = firestore()
      .collection('tasks')
      .where('uid', '==', uid)
      .onSnapshot(querySnapshot => {
          const tasksArray = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            key: doc.id,
          }));
          setTasks(tasksArray);
          setLoading(false);
          setError(null);
        }, err => {
          console.error("Error fetching tasks: ", err);
          setError(err.message);
          setLoading(false);
        });

    return () => subscriber();
  }, [uid]);

  const deleteTask = (taskId) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this task?", [
      {
        text: "Cancel",
        style: "cancel"
      },
      {
        text: "Delete",
        onPress: () => firestore().collection('tasks').doc(taskId).delete().catch(err => {
          Alert.alert("Error", "Failed to delete the task.");
          console.error("Failed to delete task: ", err);
        }),
        style: "destructive"
      }
    ]);
  };

  const renderTaskItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.taskHeader}>
        <Text style={styles.title}>{item.taskName}</Text>
        <TouchableOpacity onPress={() => deleteTask(item.key)}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>{new Date(item.deadline.seconds * 1000).toLocaleString()}</Text>
      {item.storeProgress === 'yes' && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('RecordProgress', {taskId: item.key, taskName: item.taskName, duration: item.duration, durationUnit: item.durationUnit})}>
            <Text style={styles.buttonText}>Record Progress</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('CheckProgress', {taskId: item.key, taskName: item.taskName})}>
            <Text style={styles.buttonText}>Check Progress</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading) {
    return <View style={styles.center}><Text>Loading tasks...</Text></View>;
  }

  if (error) {
    return <View style={styles.center}><Text>Error: {error}</Text></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        renderItem={renderTaskItem}
        keyExtractor={item => item.key}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('TaskPage', { uid })}>
        <Text style={styles.buttonText}>Add New Task</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  itemContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    paddingVertical: 10,
    paddingHorizontal: 5,
    width: '100%',
    marginBottom: 10,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  button: {
    backgroundColor: '#20B2AA',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
    width: '42%', // Adjusted for side-by-side buttons
    marginHorizontal: '2%', // Spacing between buttons
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    color: '#ff4444', // Red color for delete text
    fontSize: 10, // Set the font size as needed
    fontWeight: 'bold', // Bold text for the delete label
    marginTop: 5, // Optional: if you want to position your text lower
  }
});

export default TaskListPage;
