// import React, {
//   useEffect,
//   useCallback,
//   useState,
//   useLayoutEffect,
// } from "react";
// import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
// import { Avatar } from "react-native-elements";
// import { auth, db, storage } from "../firebase";
// import { signOut } from "firebase/auth";
// import { GiftedChat, Actions } from "react-native-gifted-chat";
// import { AntDesign } from "@expo/vector-icons";
// import { launchImageLibrary, launchCamera } from "react-native-image-picker";
// //import DocumentPicker from "react-native-document-picker";
// import {
//   collection,
//   addDoc,
//   query,
//   orderBy,
//   onSnapshot,
//   where,
//   updateDoc,
//   doc,
//   Timestamp,
// } from "firebase/firestore";
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
// const ChatScreen = ({ navigation, route }) => {
//   const [messages, setMessages] = useState([]);
//   const currentUser = auth.currentUser;
//   const { recipientID } = route.params;

//   const signOutNow = () => {
//     signOut(auth)
//       .then(() => {
//         navigation.replace("Login");
//       })
//       .catch((error) => {
//         console.error("Sign out error:", error);
//       });
//   };

//   useLayoutEffect(() => {
//     navigation.setOptions({
//       headerLeft: () => (
//         <View style={{ marginLeft: 30 }}>
//           <Avatar
//             rounded
//             source={{
//               uri: auth?.currentUser?.photoURL,
//             }}
//           />
//         </View>
//       ),
//       headerRight: () => (
//         <TouchableOpacity
//           style={{
//             marginRight: 10,
//           }}
//           onPress={signOutNow}
//         >
//           <Text>Đăng xuất</Text>
//         </TouchableOpacity>
//       ),
//       headerLeft: () => (
//         <View style={{ flexDirection: "row", alignItems: "center" }}>
//           <TouchableOpacity
//             onPress={() => navigation.goBack()}
//             style={{ marginLeft: 15 }}
//           >
//             <AntDesign name="arrowleft" size={24} color="black" />
//           </TouchableOpacity>
//         </View>
//       ),
//     });
//   }, [navigation, currentUser]);

//   // useEffect(() => {
//   //   const fetchUsers = async () => {
//   //     try {
//   //       const usersCollection = await getDocs(collection(db, "users"));
//   //       const usersList = usersCollection.docs.map((doc) => ({
//   //         id: doc.id,
//   //         ...doc.data(),
//   //       }));
//   //       setUsers(usersList);
//   //     } catch (error) {
//   //       console.error("Error fetching users:", error);
//   //     }
//   //   };

//   //   fetchUsers();
//   // }, []);

//   useLayoutEffect(() => {
//     navigation.setOptions({
//       headerTitle: "Chat", // Set header title
//     });
//   }, [navigation]);

//   useEffect(() => {
//     const unsubscribe = onSnapshot(
//       query(
//         collection(db, "chats"),
//         where("users", "array-contains", currentUser?.uid),
//         orderBy("createdAt", "desc")
//       ),
//       (snapshot) => {
//         const newMessages = snapshot.docs
//           .filter(
//             (doc) =>
//               (doc.data().senderID === currentUser?.uid &&
//                 doc.data().receiverID === recipientID) ||
//               (doc.data().senderID === recipientID &&
//                 doc.data().receiverID === currentUser?.uid)
//           )
//           .map((doc) => ({
//             _id: doc.id,
//             createdAt: doc.data().createdAt.toDate(),
//             text: doc.data().text,
//             image: doc.data().image || null,
//             file: doc.data().file || null,
//             //fileName: doc.data().fileName || null,
//             user: doc.data().user,
//           }));
//         setMessages(newMessages);
//       },
//       (error) => {
//         console.error("Error fetching messages:", error);
//       }
//     );

//     return () => unsubscribe();
//   }, [currentUser, recipientID]);

//   const onSend = useCallback(
//     async (messages = []) => {
//       const newMessage = messages[0];
//       const { _id, createdAt, text, user, image, file } = newMessage;

//       if (!recipientID) {
//         console.error("recipientID is undefined");
//         return;
//       }

//       await addDoc(collection(db, "chats"), {
//         _id,
//         createdAt,
//         text,
//         user,
//         image: image || null,
//         file: file || null,
//         // fileName: fileName || null,
//         senderID: currentUser?.uid,
//         receiverID: recipientID,
//         users: [currentUser?.uid, recipientID],
//       });

//       const senderDocRef = doc(db, "users", currentUser.uid);
//       const receiverDocRef = doc(db, "users", recipientID);

//       await updateDoc(senderDocRef, {
//         lastMessageSent: {
//           text,
//           createdAt,
//         },
//       });

//       await updateDoc(receiverDocRef, {
//         lastMessageReceived: {
//           text,
//           createdAt,
//         },
//       });

//       setMessages((previousMessages) =>
//         GiftedChat.append(previousMessages, newMessage)
//       );
//     },
//     [currentUser, recipientID]
//   );

//   const handleChoosePhoto = () => {
//     launchImageLibrary({ mediaType: "photo" }, async (response) => {
//       if (response.didCancel) {
//         console.log("User cancelled image picker");
//       } else if (response.error) {
//         console.log("ImagePicker Error: ", response.error);
//       } else {
//         const source = response.assets[0];
//         const storageRef = ref(storage, `chat_images/${source.fileName}`);
//         const img = await fetch(source.uri);
//         const bytes = await img.blob();
//         await uploadBytes(storageRef, bytes);
//         const imageUrl = await getDownloadURL(storageRef);

//         const message = {
//           _id: Math.random().toString(36).substring(7),
//           createdAt: new Date(),
//           text: "",
//           user: {
//             _id: currentUser?.email,
//             name: currentUser?.displayName,
//             avatar: currentUser?.photoURL,
//           },
//           image: imageUrl,
//         };

//         onSend([message]);
//       }
//     });
//   };

//   const handleTakePhoto = () => {
//     launchCamera({ mediaType: "photo" }, async (response) => {
//       if (response.didCancel) {
//         console.log("User cancelled image picker");
//       } else if (response.error) {
//         console.log("ImagePicker Error: ", response.error);
//       } else {
//         const source = response.assets[0];
//         const storageRef = ref(storage, `chat_images/${source.fileName}`);
//         const img = await fetch(source.uri);
//         const bytes = await img.blob();
//         await uploadBytes(storageRef, bytes);
//         const imageUrl = await getDownloadURL(storageRef);

//         const message = {
//           _id: Math.random().toString(36).substring(7),
//           createdAt: new Date(),
//           text: "",
//           user: {
//             _id: currentUser?.email,
//             name: currentUser?.displayName,
//             avatar: currentUser?.photoURL,
//           },
//           image: imageUrl,
//         };

//         onSend([message]);
//       }
//     });
//   };

//   const renderActions = (props) => (
//     <Actions
//       {...props}
//       options={{
//         ["Choose Photo"]: handleChoosePhoto,
//         ["Take Photo"]: handleTakePhoto,
//         // ["Choose File"]: handleChooseFile, // Thêm tùy chọn chọn file
//       }}
//       icon={() => <AntDesign name="plus" size={24} color="black" />}
//       onSend={(args) => console.log(args)}
//     />
//   );

//   return (
//     <View style={styles.container}>
//       <GiftedChat
//         messages={messages}
//         showAvatarForEveryMessage={true}
//         showUserAvatar={true}
//         onSend={(messages) => onSend(messages)}
//         user={{
//           _id: currentUser?.email,
//           name: currentUser?.displayName,
//           avatar: currentUser?.photoURL,
//         }}
//         renderActions={renderActions}
//       />
//     </View>
//   );
// };

// export default ChatScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     fontSize: 20,
//   },
//   button: {
//     alignItems: "center",
//     justifyContent: "center",
//     height: 60,
//     width: 60,
//     borderRadius: 22,
//     backgroundColor: "#007AFF",
//     marginLeft: 10,
//     marginBottom: 10,
//   },
//   buttonText: {
//     color: "#fff",
//     fontSize: 24,
//   },
// });

import React, {
  useEffect,
  useCallback,
  useState,
  useLayoutEffect,
} from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { Avatar } from "react-native-elements";
import { auth, db, storage } from "../firebase";
import { signOut } from "firebase/auth";
import { GiftedChat, Actions } from "react-native-gifted-chat";
import { AntDesign } from "@expo/vector-icons";
//import { Camera } from "react-native-camera";
import { Camera } from 'expo-camera';
// import { Camera as ExpoCamera } from 'expo-camera';


import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import { launchCamera } from "expo-image-picker";
const ChatScreen = ({ navigation, route }) => {
  const [messages, setMessages] = useState([]);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [cameraRef, setCameraRef] = useState(null);

  const currentUser = auth.currentUser;
  const { recipientID } = route.params;

  const signOutNow = () => {
    signOut(auth)
      .then(() => {
        navigation.replace("Login");
      })
      .catch((error) => {
        console.error("Sign out error:", error);
      });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <View style={{ marginLeft: 30 }}>
          <Avatar
            rounded
            source={{
              uri: auth?.currentUser?.photoURL,
            }}
          />
        </View>
      ),
      // headerRight: () => (
      //   <TouchableOpacity
      //     style={{
      //       marginRight: 10,
      //     }}
      //     onPress={signOutNow}
      //   >
      //     <Text>Đăng xuất</Text>
      //   </TouchableOpacity>
      // ),
      headerLeft: () => (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginLeft: 15 }}
          >
            <AntDesign name="arrowleft" size={24} color="black" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, currentUser]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Chat", // Set header title
    });
  }, [navigation]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(
        collection(db, "chats"),
        where("users", "array-contains", currentUser?.uid),
        orderBy("createdAt", "desc")
      ),
      (snapshot) => {
        const newMessages = snapshot.docs
          .filter(
            (doc) =>
              (doc.data().senderID === currentUser?.uid &&
                doc.data().receiverID === recipientID) ||
              (doc.data().senderID === recipientID &&
                doc.data().receiverID === currentUser?.uid)
          )
          .map((doc) => ({
            _id: doc.id,
            createdAt: doc.data().createdAt.toDate(),
            text: doc.data().text,
            image: doc.data().image || null,
            file: doc.data().file || null,
            user: doc.data().user,
          }));
        setMessages(newMessages);
      },
      (error) => {
        console.error("Error fetching messages:", error);
      }
    );

    return () => unsubscribe();
  }, [currentUser, recipientID]);

  const onSend = useCallback(
    async (messages = []) => {
      const newMessage = messages[0];
      const { _id, createdAt, text, user, image, file } = newMessage;

      if (!recipientID) {
        console.error("recipientID is undefined");
        return;
      }

      await addDoc(collection(db, "chats"), {
        _id,
        createdAt,
        text,
        user,
        image: image || null,
        file: file || null,
        users: [currentUser?.uid, recipientID],
        senderID: currentUser?.uid,
        receiverID: recipientID,
      });

      const senderDocRef = doc(db, "users", currentUser.uid);
      const receiverDocRef = doc(db, "users", recipientID);

      await updateDoc(senderDocRef, {
        lastMessageSent: {
          text,
          createdAt,
        },
      });

      await updateDoc(receiverDocRef, {
        lastMessageReceived: {
          text,
          createdAt,
        },
      });
    },
    [currentUser, recipientID]
  );

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const source = result.assets[0];
      const storageRef = ref(storage, `chat_images/${source.fileName}`);
      const img = await fetch(source.uri);
      const bytes = await img.blob();
      await uploadBytes(storageRef, bytes);
      const imageUrl = await getDownloadURL(storageRef);

      const message = {
        _id: Math.random().toString(36).substring(7),
        createdAt: new Date(),
        text: "",
        user: {
          _id: currentUser?.email,
          name: currentUser?.displayName,
          avatar: currentUser?.photoURL,
        },
        image: imageUrl,
      };

      onSend([message]);
    }
  };

  const takePhoto = async () => {
    if (cameraRef) {
      const options = { quality: 0.5, base64: true };
      const data = await cameraRef.takePictureAsync(options);

      const storageRef = ref(storage, `chat_images/${Date.now()}.jpg`);
      const img = await fetch(data.uri);
      const bytes = await img.blob();
      await uploadBytes(storageRef, bytes);
      const imageUrl = await getDownloadURL(storageRef);

      const message = {
        _id: Math.random().toString(36).substring(7),
        createdAt: new Date(),
        text: "",
        user: {
          _id: currentUser?.email,
          name: currentUser?.displayName,
          avatar: currentUser?.photoURL,
        },
        image: imageUrl,
      };

      onSend([message]);
      setCameraVisible(false);
    }
  };

  const renderActions = (props) => (
    <Actions
      {...props}
      options={{
        ["Choose Photo"]: pickImage,
        ["Take Photo"]: () => setCameraVisible(true),
      }}
      icon={() => <AntDesign name="plus" size={24} color="black" />}
      onSend={(args) => console.log(args)}
    />
  );

  return (
    <View style={styles.container}>
      <GiftedChat
        messages={messages}
        showAvatarForEveryMessage={true}
        showUserAvatar={true}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: currentUser?.email,
          name: currentUser?.displayName,
          avatar: currentUser?.photoURL,
        }}
        renderActions={renderActions}
      />

      {/* <Modal visible={cameraVisible} animationType="slide">
        <Camera
          style={styles.camera}
          type={Camera.Constants.Type.back}
          ref={(ref) => setCameraRef(ref)}
        >
       

          <View style={styles.cameraButtonContainer}>
            <TouchableOpacity style={styles.cameraButton} onPress={takePhoto}>
              <Text style={styles.cameraButtonText}>Chụp ảnh</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() => setCameraVisible(false)}
            >
              <Text style={styles.cameraButtonText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </Camera>
      </Modal> */}
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    fontSize: 20,
  },
  camera: {
    flex: 1,
    justifyContent: "flex-end",
  },
  cameraButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  cameraButton: {
    alignItems: "center",
    justifyContent: "center",
    height: 60,
    width: 100,
    borderRadius: 30,
    backgroundColor: "#007AFF",
  },
  cameraButtonText: {
    color: "#fff",
    fontSize: 18,
  },
});
