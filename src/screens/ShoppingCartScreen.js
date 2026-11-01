import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image } from 'react-native';
import ImageBackground from '../components/ImageBackground';
import { showAlert } from '../utils/alert';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons'; 
import { incrementQuantity, decrementQuantity, removeFromCart, setCartItems } from '../redux/cartSlice';

import { createOrder, imageUri } from '../api/demoApi';

const ShoppingCartScreen = ({ navigation }) => {
    const cartItems = useSelector((state) => state.cart.items);
    const token = useSelector((state) => state.auth.token); 
    const dispatch = useDispatch();

    const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    const handleDecrement = (item) => {
        if (item.quantity === 1) {
            showAlert(
                "Remove Item",
                "Are you sure you want to delete this item from the cart?",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Delete", style: "destructive", onPress: () => dispatch(removeFromCart(item.id)) }
                ]
            );
        } else {
            dispatch(decrementQuantity(item.id));
        }
    };

    const handleCheckout = async () => {
        const data = await createOrder(token, cartItems);
        if (data.status === "error") {
            showAlert("Checkout Failed", data.message || "Could not process order.");
            return;
        }
        showAlert("Success!", "Your order has been placed.");
        dispatch(setCartItems([]));
        navigation.navigate("My Orders");
    };

    const renderCartItem = ({ item }) => (
        <View style={styles.cartItem}>
            <Image source={{ uri: imageUri(item.image) }} style={styles.itemImage} />
            <View style={styles.itemDetails}>
                <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.itemPrice}>Price: ${item.price.toFixed(2)}</Text>
                <View style={styles.quantityContainer}>
                    <TouchableOpacity onPress={() => handleDecrement(item)}>
                        <Ionicons name="remove-circle" size={28} color="#458345" />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>quantity: {item.quantity}</Text>
                    <TouchableOpacity onPress={() => dispatch(incrementQuantity(item.id))}>
                        <Ionicons name="add-circle" size={28} color="#458345" />
                    </TouchableOpacity>
                </View>
            </View>
            <TouchableOpacity onPress={() => dispatch(removeFromCart(item.id))} style={styles.removeBtn}>
                <Ionicons name="trash-outline" size={24} color="#cc0000" />
            </TouchableOpacity>
        </View>
    );

    return (
        <ImageBackground source={require('../assets/backgrounds/linesBG.png')} style={styles.container}>
            <View style={styles.summaryContainer}>
                <View>
                    <Text style={styles.summaryText}>Total Items: {totalQuantity}</Text>
                    <Text style={styles.totalPriceText}>Total: ${totalPrice.toFixed(2)}</Text>
                </View>
                
                {cartItems.length > 0 && (
                    <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
                        <Text style={styles.checkoutButtonText}>Check Out</Text>
                    </TouchableOpacity>
                )}
            </View>

            {cartItems.length === 0 ? (
                <View style={styles.centerWrapper}>
                    <View style={styles.emptyCard}>
                        <Ionicons name="cart-outline" size={60} color="#000" style={{ marginBottom: 10 }} />
                        <Text style={styles.emptyText}>Your shopping cart is empty</Text>
                    </View>
                </View>
            ) : (
                <FlatList
                    data={cartItems}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderCartItem}
                    contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
                />
            )}
        </ImageBackground>
    );
};
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFB81C' },
    summaryContainer: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: '#FDF5D6',
        borderBottomWidth: 3,
        borderColor: '#000',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    summaryText: { fontSize: 16, fontWeight: 'bold' },
    totalPriceText: { fontSize: 18, fontWeight: 'bold', color: '#4A76C0' },
    checkoutButton: {
        backgroundColor: '#4A76C0',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#000',
    },
    checkoutButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    centerWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyCard: { 
        backgroundColor: '#FDF5D6', 
        padding: 40, 
        borderRadius: 20, 
        borderWidth: 3, 
        borderColor: '#000',
        width: '85%',
        alignItems: 'center'
    },
    emptyText: { fontSize: 18, fontWeight: 'bold', color: '#000', textAlign: 'center' },
    cartItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginHorizontal: 15,
        marginVertical: 8,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#000',
    },
    itemImage: { width: 60, height: 60, resizeMode: 'contain', borderWidth: 1, borderColor: '#ccc', borderRadius: 5 },
    itemDetails: { flex: 1, paddingLeft: 15 },
    itemTitle: { fontSize: 13, color: '#333' },
    itemPrice: { fontSize: 14, fontWeight: 'bold', color: '#000', marginVertical: 4 },
    quantityContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
    quantityText: { marginHorizontal: 12, fontSize: 14, fontWeight: 'bold', color: '#333' },
    removeBtn: { padding: 5 },
});

export default ShoppingCartScreen;