import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './Login';
import Signup from './Signup';
import TaskPage from './TaskPage';
import HomePage from './HomePage';
import TaskListPage from './TaskListPage';
import RecordProgress from './RecordProgress';
import CheckProgress from './CheckProgress';
import firestore from '@react-native-firebase/firestore';
import PushNotification from 'react-native-push-notification';

const Stack = createNativeStackNavigator();

const App = () => {
  useEffect(() => {
    const channelId = "12316";
    PushNotification.configure({
      onRegister: token => console.log('TOKEN:', token),
      onNotification: notification => console.log('NOTIFICATION:', notification),
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    });

    PushNotification.createChannel({
      channelId,
      channelName: "Reminder Notifications",
      channelDescription: "A channel to manage your reminder notifications",
      soundName: "default",
      importance: 4,
      vibrate: true,
    }, created => console.log(`Create channel returned '${created}'`));

    const unsubscribe = firestore()
      .collection('tasks')
      .onSnapshot(querySnapshot => {
        querySnapshot.forEach(doc => {
          const task = doc.data();
          if (task.deadline && task.frequency) {
            console.log(`Deadline for task "${task.taskName}" is at ${task.deadline.toDate()}`);
            scheduleNotifications(task.deadline, task.frequency, doc.id, task.taskName);
          } else {
            console.log(`No deadline or frequency found for task ${doc.id}`);
          }
        });
      }, error => {
        console.log("Error fetching tasks:", error);
      });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  function scheduleNotifications(deadlineTimestamp, frequency, taskId, title) {
    const deadlineDate = deadlineTimestamp.toDate();
    const now = new Date();
    const frequencyInt = parseInt(frequency, 10); // Convert frequency to an integer
  
    // Schedule the additional notification for 5 minutes after the deadline
    const afterDeadlineTime = new Date(deadlineDate.getTime() + 5 * 60 * 1000);
    
    if (afterDeadlineTime > now) {
      PushNotification.localNotificationSchedule({
        channelId: "12316",
        title: "Record the progress",
        message: `Please record your progress for "${title}" `,
        date: afterDeadlineTime,
        allowWhileIdle: true,
      });
      console.log(`Additional notification scheduled for task ${taskId} at ${afterDeadlineTime}`);
    }
  
    // Calculate the intervals for notifications before the deadline
    for (let i = 1; i <= frequencyInt; i++) {
      const timeBeforeDeadline = (deadlineDate - now) / frequencyInt * i;
      const notificationTime = new Date(now.getTime() + timeBeforeDeadline);
  
      // Adjust the last notification to be 2 minutes before the deadline
      if (i === frequencyInt) {
        notificationTime.setTime(deadlineDate.getTime() - 2 * 60 * 1000);
      }
  
      if (notificationTime > now) {
        PushNotification.localNotificationSchedule({
          channelId: "12316",
          title: `Task Deadline Approaching`,
          message: `Reminder: The deadline for task "${title}" is approaching.`,
          date: notificationTime,
          allowWhileIdle: true,
        });
        console.log(`Notification ${i} scheduled for task ${taskId} at ${notificationTime}`);
      }
    }
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="TaskPage" component={TaskPage} options={{ title: 'Add Task' }} />
        <Stack.Screen name="HomePage" component={HomePage} />
        <Stack.Screen name="TaskListPage" component={TaskListPage} options={{ title: 'Task History' }} />
        <Stack.Screen name="RecordProgress" component={RecordProgress} options={{ title: 'Record Progress' }} />
        <Stack.Screen name="CheckProgress" component={CheckProgress} options={{ title: 'Check Progress' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
