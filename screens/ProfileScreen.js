import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { db, auth } from '../firebase';

const ProfileScreen = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRef, setUserRef] = useState(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCurrentUser(user);
            if (user) {
                setUserRef(db.collection('users').doc(user.uid));
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (userRef) {
            userRef.get()
                .then((doc) => {
                    if (doc.exists) {
                        const userData = doc.data();
                        setCurrentUser(prevUser => ({
                            ...prevUser,
                            name: userData.name,
                            photoURL: userData.photoURL,
                            email: userData.email,
                        }));
                    } else {
                        console.log('No such document!');
                    }
                })
                .catch((error) => {
                    console.log('Error getting document:', error);
                });
        }
    }, [userRef]);

    return (
        <View style={styles.container}>
            <View style={styles.profileHeader}>
                {currentUser && (
                    <>
                        <Image
                            source={{ uri: currentUser.photoURL }}
                            style={styles.avatar}
                        />
                        <Text style={styles.username}>{currentUser.name || 'Anonymous'}</Text>
                    </>
                )}
                <TouchableOpacity style={styles.editButton}>
                    <Text style={styles.editButtonText}>Edit Profile</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.profileInfo}>
                <Text style={styles.sectionTitle}>User Information</Text>
                <Text>Email: {currentUser?.email || 'N/A'}</Text>
                <Text>Name: {currentUser?.name || 'N/A'}</Text> 
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    avatar: {
        width: 150,
        height: 150,
        borderRadius: 75,
        marginBottom: 10,
    },
    username: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    editButton: {
        backgroundColor: '#007bff',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    editButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    profileInfo: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
});

export default ProfileScreen;
