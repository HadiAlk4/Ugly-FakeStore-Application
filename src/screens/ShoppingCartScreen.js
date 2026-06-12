import React, { useEffect } from 'react'; // <-- ADDED useEffect
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, ImageBackground, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons'; 
import { incrementQuantity, decrementQuantity, removeFromCart, clearCart } from '../redux/cartSlice';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const ShoppingCartScreen = ({ navigation }) => {
    const cartItems = useSelector((state) => state.cart.items);
    const isHydrated = useSelector((state) => state.cart.isHydrated);
    const token = useSelector((state) => state.auth.token); 
    const dispatch = useDispatch();

    const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    // NEW: Background Cart Synchronization!
    // Whenever `cartItems` change, silently upload the new list to the database
    useEffect(() => {
        const syncCartWithServer = async () => {
            if (token && isHydrated) {
                // Format items exactly how the API demands
                const formattedItems = cartItems.map(item => ({
                    id: item.id,
                    price: item.price,
                    count: item.quantity
                }));

                try {
                    await fetch(`${API_BASE_URL}/cart`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ items: formattedItems })
                    });
                } catch (error) {
                    console.error("Cart Auto-Sync Error:", error);
                }
            }
        };
        syncCartWithServer();
    }, [cartItems, token, isHydrated]); // The engine triggers ANY time the cart changes!

    const handleDecrement = (item) => {
        if (item.quantity === 1) {
            Alert.alert(
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
        try {
            const formattedItems = cartItems.map(item => ({
                prodID: item.id,
                price: item.price,
                quantity: item.quantity
            }));

            const response = await fetch(`${API_BASE_URL}/orders/neworder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ items: formattedItems }),
            });

            const data = await response.json();

            if (data.status === "error") {
                Alert.alert("Checkout Failed", data.message || "Could not process order.");
                return;
            }

            Alert.alert("Success!", "Your order has been placed.");
            dispatch(clearCart()); 
            navigation.navigate("My Orders"); 

        } catch (error) {
            console.error("Checkout Error:", error);
            Alert.alert("Server Error", "Could not connect to the backend server to checkout.");
        }
    };

    const renderCartItem = ({ item }) => (
        <View style={styles.cartItem}>
            <Image source={{ uri: `${API_BASE_URL}${item.image}` }} style={styles.itemImage} />
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