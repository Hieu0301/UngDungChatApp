
import {
  Button,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import ListItem from "../component/ListItem";
import Users from "../tabs/Users";
import Setting from "../tabs/Setting";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";

const HomeScreen = () => {
  const [users, setUsers] = useState([]);
  const [selectedTab, setSelectedtab] = useState(0);
  const navigation = useNavigation();

  // const getUsers = async () => {
  //   const docsRef = collection(db, "users");
  //   const q = query(docsRef, where("userUID", "!=", auth?.currentUser?.email));
  //   const docSnap = onSnapshot(q, (onSnap) => {
  //     let data = [];
  //     onSnap.docs.forEach((user) => {
  //       data.push({ ...user.data() });
  //       setUsers(data);
  //       console.log(user.data());
  //     });
  //   });
  // };

  // useEffect(() => {
  //   getUsers();
  // }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = await getDocs(collection(db, "users"));
        const usersList = usersCollection.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const openChat = (recipientID) => {
    navigation.navigate("ChatScreen", { recipientID }); // Navigate to ChatScreen with recipientID
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.item} onPress={() => openChat(item.id)}>
      <Text style={styles.title}>{item.name}</Text>
    </TouchableOpacity>
  );
  return (
    <View style={styles.container}>
      {selectedTab == 0 ? <Users /> : <Setting />}
      {/* <Button title="Create new Group" /> */}
      <View style={styles.bottomTab}>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => {
            navigation.navigate("ProfileScreen"); // Điều hướng tới màn hình "ProfileScreen"
          }}
        >
          <View>
            <Ionicons name="person-sharp" size={30} color="black" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("GroupScreen"); // Điều hướng tới màn hình "Groupscreen"
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <FontAwesome name="group" size={24} color="black" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => {
            navigation.navigate("FriendScreen"); // Điều hướng tới màn hình "Groupscreen"
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <FontAwesome5 name="user-friends" size={24} color="black" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  item: {
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  title: {
    fontSize: 18,
  },
  bottomTab: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 70,
    backgroundColor: "purple",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  tab: {
    width: "50%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  tabIcon: {
    width: 30,
    height: 30,
  },
});

