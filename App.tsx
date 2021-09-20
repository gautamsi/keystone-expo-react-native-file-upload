import React, { useState, useEffect } from 'react';
import { ApolloClient, ApolloProvider, InMemoryCache, gql, useMutation } from '@apollo/client';
import { createUploadLink, ReactNativeFile } from 'apollo-upload-client';
import { StyleSheet, Text, View, Button, Clipboard, Image, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import * as mime from 'react-native-mime-types';

// you may not need this thing
const fixAndroidPickerUri = (uri: string) => {
  if (Platform.OS === 'android' && !uri.startsWith('file:')) return encodeURI(`file://${uri}`);
  else return uri;
};

function generateRNFile(uri: any, name: any) {
  return uri
    ? new ReactNativeFile({
        uri: fixAndroidPickerUri(uri),
        type: mime.lookup(uri) || 'png',
        name,
      })
    : null;
}

const client = new ApolloClient({
  // @ts-ignore
  link: createUploadLink({
    uri: `http://localhost:3000/api/graphql`,
    credentials: 'include', // 'include',
  }),
  cache: new InMemoryCache(),
  credentials: 'same-origin',
});

function App() {
  const [image, setImage] = useState(null);
  const [percentage, setPercentage] = useState(0);
  const [createUser, { loading }] = useMutation(gql`
    mutation Mutation($data: UserCreateInput!) {
      createUser(data: $data) {
        id
      }
    }
  `);
  useEffect(() => {
    (async () => {
      if (Constants.platform.ios) {
        const cameraRollStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
        const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraRollStatus.status !== 'granted' || cameraStatus.status !== 'granted') {
          alert('Sorry, we need these permissions to make this work!');
        }
      }
    })();
  }, []);

  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'Images',
      aspect: [4, 3],
    });

    handleImagePicked(result);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'Images',
      aspect: [4, 3],
      quality: 1,
    });

    handleImagePicked(result);
  };

  const handleImagePicked = async (pickerResult) => {
    try {
      if (pickerResult.cancelled) {
        alert('Upload cancelled');
        return;
      } else {
        setPercentage(0);
        const img = await generateRNFile(pickerResult.uri, 'demo.jpg');
        uploadImage(img);
      }
    } catch (e) {
      console.log(e);
      alert('Upload failed');
    }
  };

  const uploadImage = (image) => {
    const name = Math.random().toString().slice(2);
    const email = `${name}@email.com`;
    createUser({ variables: { data: { name, email, avatar: { upload: image }, attachment: { upload: image } } } })
      .then(() => {
        alert('uploaded');
      })
      .catch((e) => alert(e.message));
  };

  const copyToClipboard = () => {
    Clipboard.setString(image);
    alert('Copied image URL to clipboard');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Keystone 6 Upload Demo</Text>
      {percentage !== 0 && <Text style={styles.percentage}>{percentage}%</Text>}

      {image && (
        <View>
          <Text style={styles.result} onPress={copyToClipboard}>
            <Image source={{ uri: image }} style={{ width: 250, height: 250 }} />
          </Text>
          <Text style={styles.info}>Long press to copy the image url</Text>
        </View>
      )}

      <Button onPress={pickImage} title="Pick an image from camera roll" />
      <Button onPress={takePhoto} title="Take a photo" />
    </View>
  );
}

export default () => (
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
    marginHorizontal: 15,
  },
  percentage: {
    marginBottom: 10,
  },
  result: {
    paddingTop: 5,
  },
  info: {
    textAlign: 'center',
    marginBottom: 20,
  },
});
