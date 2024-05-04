import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

const HomePage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const uid = route.params?.uid;
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Fetch user data
    const getUserData = async () => {
      try {
        const userDocument = await firestore().collection('users').doc(uid).get();
        if (userDocument.exists) {
          setUserName(userDocument.data().name);
        } else {
          console.log('No such user!');
        }
      } catch (error) {
        console.error("Error fetching user's data: ", error);
      }
    };

    if (uid) {
      getUserData();
    }

    // Set the logout button on the top right
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      ),
    });
  }, [uid, navigation]);

  // Function to handle the logout logic
  const logout = () => {
    // Implement your logout functionality here
    // For example, navigate to the login screen:
    navigation.replace('Login');
  };

  const navigateToTaskPage = () => {
    navigation.navigate('TaskPage', { uid });
  };

  const navigateToPreviousTasks = () => {
    navigation.navigate('TaskListPage', { uid });
  };

  // Displaying a welcome message using the user's name
  const welcomeMessage = userName ? `Welcome, ${userName}!` : 'Welcome, Guest!';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{welcomeMessage}</Text>
      <TouchableOpacity style={styles.button} onPress={navigateToTaskPage}>
        <Text style={styles.buttonText}>Add Task</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={navigateToPreviousTasks}>
        <Text style={styles.buttonText}>See Previous Tasks</Text>
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
  title: {
    fontSize: 24,
    color: '#5a5a5a',
    fontWeight: 'bold',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#20B2AA',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    marginRight: 10,
    backgroundColor: '#20B2AA', // Adjust color as needed
    padding: 8,
    borderRadius: 5,
  },
  logoutButtonText: {
    color: 'white', // Adjust text color as needed
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomePage;
