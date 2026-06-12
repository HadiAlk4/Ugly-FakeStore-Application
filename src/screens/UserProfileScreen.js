import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ImageBackground, Image, Modal } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess, logout } from '../redux/authSlice';
// NEW: Import our cart and order clear/set actions
import { clearCart, setCartItems } from '../redux/cartSlice';
import { clearOrderBadge } from '../redux/orderSlice';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL; 

const UserProfileScreen = () => {
    const dispatch = useDispatch();
    const { isLoggedIn, user, token } = useSelector((state) => state.auth);

    const [isSignIn, setIsSignIn] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
    const [updateName, setUpdateName] = useState('');
    const [updatePassword, setUpdatePassword] = useState('');

    const handleClear = () => {
        setName(''); setEmail(''); setPassword('');
    };

    const handleSubmit = async () => {
        if (!email || !password || (!isSignIn && !name)) {
            Alert.alert("Validation Error", "Please fill in all required fields.");
            return;
        }

        const endpoint = isSignIn ? '/users/signin' : '/users/signup';
        const payload = isSignIn ? { email, password } : { name, email, password };

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await response.json();

            if (data.status === "error") {
                Alert.alert("Authentication Failed", data.message || "Invalid credentials.");
                return;
            }

            // 1. Log the user in
            dispatch(loginSuccess({ user: { name: data.name, email: data.email }, token: data.token }));
            
            // 2. REHYDRATE THE CART (Requirement 12)
            try {
                const cartRes = await fetch(`${API_BASE_URL}/cart`, {
                    headers: { 'Authorization': `Bearer ${data.token}` }
                });
                const cartData = await cartRes.json();
                
                if (cartData.status === 'OK' && cartData.items && cartData.items.length > 0) {
                    // The API only returns {id, price, count}. We need to fetch the images/titles!
                    const restoredCart = await Promise.all(cartData.items.map(async (item) => {
                        const prodRes = await fetch(`${API_BASE_URL}/products/${item.id}`);
                        const prodData = await prodRes.json();
                        return {
                            ...prodData, // Gives us the image, title, rating, etc.
                            quantity: item.count // Map API 'count' to our Redux 'quantity'
                        };
                    }));
                    dispatch(setCartItems(restoredCart));
                } else {
                    dispatch(setCartItems([]));
                }
            } catch (err) {
                console.error("Cart Sync Error:", err);
                dispatch(setCartItems([]));
            }

            if (isSignIn) {
                Alert.alert("Welcome Back!", `Successfully signed in as ${data.name}`);
            } else {
                Alert.alert("Success", "Account created successfully! Logging you in...");
            }
            handleClear();
        } catch (error) {
            console.error("Auth API Error:", error);
            Alert.alert("Server Error", "Could not connect to the backend server.");
        }
    };

    const handleUpdateProfile = async () => {
        if (!updateName || !updatePassword) {
            Alert.alert("Validation Error", "Please provide a new name and password.");
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/users/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ name: updateName, password: updatePassword }),
            });
            const data = await response.json();

            if (data.status === "error") {
                Alert.alert("Update Failed", data.message || "Could not update profile.");
                return;
            }
            dispatch(loginSuccess({ user: { name: data.name, email: user.email }, token: token }));
            Alert.alert("Success", data.message || "Profile updated successfully!");
            
            setIsUpdateModalVisible(false);
            setUpdateName(''); setUpdatePassword('');
        } catch (error) {
            Alert.alert("Server Error", "Could not connect to the backend server.");
        }
    };

    const openUpdateModal = () => {
        setUpdateName(user?.name || ''); 
        setUpdatePassword('');
        setIsUpdateModalVisible(true);
    };

    if (isLoggedIn) {
        return (
            <View style={styles.container}>
                <ImageBackground source={require('../assets/backgrounds/texture.png')} style={styles.backgroundImage} resizeMode="repeat">
                    <View style={styles.formWrapper}>
                        <View style={styles.profileHeaderBar}>
                            <Text style={styles.profileHeaderBarText}>User Profile</Text>
                        </View>

                        <View style={styles.formContainer}>
                            <View style={styles.profileDataRow}>
                                <Text style={styles.profileLabel}>User Name:</Text>
                                <Text style={styles.profileValue}>{user?.name}</Text>
                            </View>
                            <View style={styles.profileDataRow}>
                                <Text style={styles.profileLabel}>Email:</Text>
                                <Text style={styles.profileValue}>{user?.email}</Text>
                            </View>

                            <View style={styles.buttonRow}>
                                <TouchableOpacity style={[styles.button, styles.updateButton]} onPress={openUpdateModal}>
                                    <Image source={require('../assets/Items/update.png')} style={styles.buttonIconLight} />
                                    <Text style={styles.submitButtonText}>Update</Text>
                                </TouchableOpacity>

                                {/* UPDATED: Sign Out wipes Cart and Badges! (Requirement 11) */}
                                <TouchableOpacity 
                                    style={[styles.button, styles.signOutButton]} 
                                    onPress={() => {
                                        dispatch(logout());
                                        dispatch(clearCart());
                                        dispatch(clearOrderBadge());
                                    }}
                                >
                                    <Image source={require('../assets/Items/signOut.png')} style={styles.buttonIconDark} />
                                    <Text style={styles.signOutButtonText}>Sign Out</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <Modal visible={isUpdateModalVisible} transparent={true} animationType="fade">
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContainer}>
                                <Text style={styles.headerText}>Update Profile</Text>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>New User Name</Text>
                                    <TextInput style={styles.input} value={updateName} onChangeText={setUpdateName} placeholder="Enter new name" placeholderTextColor="#777" />
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>New Password</Text>
                                    <TextInput style={styles.input} value={updatePassword} onChangeText={setUpdatePassword} placeholder="Enter new password" placeholderTextColor="#777" secureTextEntry={true} />
                                </View>
                                <View style={styles.buttonRow}>
                                    <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={() => setIsUpdateModalVisible(false)}>
                                        <Text style={styles.clearButtonText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={handleUpdateProfile}>
                                        <Text style={styles.submitButtonText}>Confirm</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </ImageBackground>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ImageBackground source={require('../assets/backgrounds/texture.png')} style={styles.backgroundImage} resizeMode="repeat">
                <View style={styles.formWrapper}>
                    <View style={styles.formContainer}>
                        <Text style={styles.headerText}>{isSignIn ? 'Sign in with your email and password' : 'Sign up a new user'}</Text>

                        {!isSignIn && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>User Name</Text>
                                <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Enter your name" placeholderTextColor="#777" />
                            </View>
                        )}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Enter your email" placeholderTextColor="#777" keyboardType="email-address" autoCapitalize="none" />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Enter your password" placeholderTextColor="#777" secureTextEntry={true} />
                        </View>

                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={handleClear}>
                                <Image source={require('../assets/Items/clear.png')} style={styles.buttonIconDark} />
                                <Text style={styles.clearButtonText}>Clear</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={handleSubmit}>
                                <Image source={require('../assets/Items/signUp.png')} style={styles.buttonIconLight} />
                                <Text style={styles.submitButtonText}>{isSignIn ? 'Sign In' : 'Sign Up'}</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity onPress={() => { setIsSignIn(!isSignIn); handleClear(); }}>
                            <Text style={styles.toggleText}>{isSignIn ? 'Switch to: sign up a new user' : 'Switch to: sign in with an existing user'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ImageBackground>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFB81C',
    },
    backgroundImage: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    formWrapper: {
        width: '100%',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
    },
    profileHeaderBar: {
        width: '85%',
        backgroundColor: '#4A76C0',
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 3,
        borderColor: '#000',
        alignItems: 'center',
        marginBottom: 15,
    },
    profileHeaderBarText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    formContainer: {
        width: '85%',
        backgroundColor: '#FDF5D6',
        padding: 20,
        borderRadius: 15,
        borderWidth: 3,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 5,
    },
    headerText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 20,
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        color: '#000',
        marginBottom: 5,
        fontSize: 14,
        fontWeight: 'bold',
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: '#000',
        paddingHorizontal: 15,
        paddingVertical: 10,
        fontSize: 16,
        color: '#000',
    },
    profileDataRow: {
        flexDirection: 'row',
        marginBottom: 15,
        alignItems: 'center',
    },
    profileLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        width: 100,
    },
    profileValue: {
        fontSize: 16,
        color: '#333',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        marginBottom: 10,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#000',
    },
    buttonIconLight: {
        width: 18,
        height: 18,
        marginRight: 8,
        resizeMode: 'contain',
        tintColor: '#fff', 
    },
    buttonIconDark: {
        width: 18,
        height: 18,
        marginRight: 8,
        resizeMode: 'contain',
        tintColor: '#000', 
    },
    clearButton: {
        backgroundColor: '#fff',
        marginRight: 10,
    },
    submitButton: {
        backgroundColor: '#4A76C0',
        marginLeft: 10,
    },
    updateButton: {
        backgroundColor: '#4A76C0',
        marginRight: 10,
    },
    signOutButton: {
        backgroundColor: '#fff',
        marginLeft: 10,
    },
    clearButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 15,
    },
    submitButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15,
    },
    signOutButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 15,
    },
    toggleText: {
        color: '#000',
        textAlign: 'center',
        marginTop: 10,
        textDecorationLine: 'underline',
        fontSize: 13,
    },
    // Modal Specific Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // Darkens the background behind the popup
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '85%',
        backgroundColor: '#FDF5D6',
        padding: 20,
        borderRadius: 15,
        borderWidth: 3,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 5,
    }
});

export default UserProfileScreen;