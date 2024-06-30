
import React, { useState, useEffect } from "react";
import { FlatList, Pressable, Text, TextInput, TouchableOpacity, View, StyleSheet } from "react-native";
import { collection, addDoc, onSnapshot, where, query } from "firebase/firestore";
import { db } from "../firebase";
import { auth } from "../firebase";

const GroupScreen = ({ navigation }) => {
  const [groupName, setGroupName] = useState("");
  const [groups, setGroups] = useState([]);

  const [textInputRef, setTextInputRef] = useState(null);

  //lắng nghe các thay đổi trong nhóm
  useEffect(() => {
    const currentUserUid = auth.currentUser.uid;//lấy UID của người dùng hiện tại từ Firebase Authentication.
    const q = query(collection(db, "groups"), where("members", "array-contains", currentUserUid));// tạo một truy vấn (query) để lấy các nhóm (groups) mà người dùng hiện tại là thành viên 
    const unsubscribe = onSnapshot(q, (snapshot) => {//Thiết lập listener để lắng nghe các thay đổi trong kết quả của truy vấn q.
      const updatedGroups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));//Duyệt qua từng tài liệu trong snapshot và tạo một mảng mới updatedGroups
      setGroups(updatedGroups);//Cập nhật trạng thái group
    });

    return () => unsubscribe();
  }, []);

  const handleCreateNewGroup = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const currentUserUid = currentUser.uid;
        const members = [currentUserUid];//const members = [currentUserUid];

        const docRef = await addDoc(collection(db, "groups"), {
          name: groupName,
          creatorId: currentUserUid,
          members: members
        });
        setGroupName("");
        if (textInputRef) {
          textInputRef.blur();
        }
      } else {
        console.error("No user is currently logged in.");
      }
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const handleGroupPress = (groupId) => {
    navigation.navigate("GroupChatScreen", { groupId });
  };

  return (
    <View style={styles.container}>
      <View style={styles.groupSection}>
        <Text style={styles.title}>Tạo nhóm chat mới</Text>
        <TextInput
          ref={(ref) => {
            setTextInputRef(ref);
          }}
          style={styles.input}
          placeholder="Nhập tên nhóm"
          value={groupName}
          onChangeText={setGroupName}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={handleCreateNewGroup}
        >
          <Text style={styles.buttonText}>Tạo nhóm</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.groupItem}
            onPress={() => handleGroupPress(item.id)}
          >
            <Text style={styles.groupName}>{item.name}</Text>
          </Pressable>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  button: {
    width: '100%',
    backgroundColor: '#007bff',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  groupItem: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  groupName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  groupSection: {
    marginBottom: 20,
  },
});

export default GroupScreen;



