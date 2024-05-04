import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import PushNotification from 'react-native-push-notification';

const NotificationService = () => {

  useEffect(() => {
    // Immediate test notification
    console.log("Attempting to show a notification");
    PushNotification.localNotification({
      channelId: 'r125',
      title: "Test Notification",
      message: "This is a test notification",
    });
    console.log('Immediate notification sent');

    // Schedule another test notification for 5 minutes after app open
    setTimeout(() => {
      PushNotification.localNotification({
        channelId: 'r125',
        title: "Delayed Test Notification",
        message: "This notification was scheduled 5 minutes after app start",
      });
      console.log('Delayed notification scheduled');
    }, 1000); 
  }, []);

  return (
    <View>
      <Text>Notification Service Initialized</Text>
    </View>
  );
};

export default NotificationService;
