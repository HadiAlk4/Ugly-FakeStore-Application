import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, ImageBackground, Image } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { setNewOrderCount } from '../redux/orderSlice';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const OrderCard = ({ order, onUpdateStatus, token }) => {
    const [expanded, setExpanded] = useState(false);
    const [detailedItems, setDetailedItems] = useState([]);
    const [loadingDetails, setLoadingDetails] = useState(false);

    let parsedItems = [];
    try {
        parsedItems = JSON.parse(order.order_items);
    } catch (e) {
        console.error("Failed to parse order items", e);
    }

    const handleExpand = async () => {
        setExpanded(!expanded);
        // Only fetch the product details from the backend if we haven't already
        if (!expanded && detailedItems.length === 0) {
            setLoadingDetails(true);
            try {
                const fetchedItems = await Promise.all(
                    parsedItems.map(async (item) => {
                        const actualId = item.prodID || item.id || item.productId;
                        const res = await fetch(`${API_BASE_URL}/products/${actualId}`);
                        const data = await res.json();
                        return { ...item, title: data.title, image: data.image };
                    })
                );
                setDetailedItems(fetchedItems);
            } catch (error) {
                console.error("Error fetching item details", error);
            } finally {
                setLoadingDetails(false);
            }
        }
    };

    return (
        <View style={styles.orderCard}>
            <TouchableOpacity style={styles.compactView} onPress={handleExpand}>
                <View>
                    <Text style={styles.orderIdText}>Order #{order.id}</Text>
                    <Text style={styles.orderSummaryText}>{order.item_numbers} Items | Total: ${(order.total_price / 100).toFixed(2)}</Text>
                </View>
                <Text style={styles.caret}>{expanded ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {expanded && (
                <View style={styles.expandedView}>
                    <Text style={styles.itemsHeaderText}>Items in Order:</Text>
                    {loadingDetails ? (
                        <ActivityIndicator size="small" color="#4A76C0" />
                    ) : (
                        detailedItems.map((item, index) => {
                            const actualId = item.prodID || item.id || item.productId;
                            return (
                                <View key={index} style={styles.detailedItemRow}>
                                    {item.image && <Image source={{ uri: `${API_BASE_URL}${item.image}` }} style={styles.orderItemImage} />}
                                    <View style={styles.orderItemInfo}>
                                        <Text style={styles.orderItemTitle}>{item.title || `Product ID: ${actualId}`}</Text>
                                        <Text style={styles.itemDetailText}>Qty: {item.quantity} | ${item.price.toFixed(2)}</Text>
                                    </View>
                                </View>
                            );
                        })
                    )}

                    <View style={styles.actionRow}>
                        {order.is_paid === 0 && order.is_delivered === 0 && (
                            <TouchableOpacity 
                                style={[styles.actionButton, styles.payButton]}
                                onPress={() => onUpdateStatus(order.id, 1, 0)} 
                            >
                                <Text style={styles.buttonText}>Pay Now</Text>
                            </TouchableOpacity>
                        )}

                        {order.is_paid === 1 && order.is_delivered === 0 && (
                            <TouchableOpacity 
                                style={[styles.actionButton, styles.receiveButton]}
                                onPress={() => onUpdateStatus(order.id, 1, 1)} 
                            >
                                <Image source={require('../assets/Items/recieve.png')} style={styles.buttonIconDark} />
                                <Text style={styles.buttonText}>Mark Received</Text>
                            </TouchableOpacity>
                        )}

                        {order.is_paid === 1 && order.is_delivered === 1 && (
                            <Text style={styles.completedText}>Order Complete</Text>
                        )}
                    </View>
                </View>
            )}
        </View>
    );
};

const MyOrdersScreen = () => {
    const { token } = useSelector((state) => state.auth);
    const dispatch = useDispatch(); 
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            setOrders([]);
        }
    }, [token]);

    useFocusEffect(
        useCallback(() => {
            if (token) {
                fetchOrders();
            }
        }, [token])
    );

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/orders/all`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.status === 'OK') {
                setOrders(data.orders);
                
                // Redux Badge Tracker (Requirement 8)
                const newCount = data.orders.filter(o => o.is_paid === 0 && o.is_delivered === 0).length;
                dispatch(setNewOrderCount(newCount));
            } else {
                Alert.alert("Error", data.message || "Failed to load orders.");
            }
        } catch (error) {
            console.error("Fetch Orders Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateOrderStatus = async (orderID, isPaid, isDelivered) => {
        try {
            const response = await fetch(`${API_BASE_URL}/orders/updateorder`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ orderID, isPaid, isDelivered })
            });

            const data = await response.json();

            if (data.status === 'OK') {
                Alert.alert("Success", "Order status updated successfully!");
                fetchOrders(); 
            } else {
                Alert.alert("Update Failed", data.message || "Could not update order.");
            }
        } catch (error) {
            console.error("Update Order Error:", error);
            Alert.alert("Server Error", "Could not connect to the backend.");
        }
    };

    const newOrders = orders.filter(o => o.is_paid === 0 && o.is_delivered === 0);
    const paidOrders = orders.filter(o => o.is_paid === 1 && o.is_delivered === 0);
    const deliveredOrders = orders.filter(o => o.is_paid === 1 && o.is_delivered === 1);

    const renderOrderSection = (title, data) => (
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {data.length === 0 ? (
                <Text style={styles.emptySectionText}>No orders in this category.</Text>
            ) : (
                data.map((order) => (
                    <OrderCard 
                        key={order.id} 
                        order={order} 
                        onUpdateStatus={handleUpdateOrderStatus} 
                        token={token}
                    />
                ))
            )}
        </View>
    );

    return (
        <ImageBackground source={require('../assets/backgrounds/linesBG.png')} style={styles.container}>
            <View style={styles.headerBox}>
                <Text style={styles.headerTitle}>MY ORDERS</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#000" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={[{ id: 'dummy' }]}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    renderItem={() => (
                        <View>
                            {renderOrderSection("New Orders", newOrders)}
                            {renderOrderSection("Paid (Pending Delivery)", paidOrders)}
                            {renderOrderSection("Delivered", deliveredOrders)}
                        </View>
                    )}
                />
            )}
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFB81C' },
    headerBox: {
        width: '100%',
        backgroundColor: '#4A76C0',
        paddingTop: 60,
        paddingBottom: 20,
        borderBottomWidth: 3,
        borderColor: '#000',
        alignItems: 'center',
    },
    headerTitle: { color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: 1 },
    sectionContainer: {
        marginTop: 20,
        paddingHorizontal: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        backgroundColor: '#FDF5D6',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#000',
        marginBottom: 10,
        overflow: 'hidden',
    },
    emptySectionText: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#333',
        marginLeft: 15,
        marginBottom: 10,
    },
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#000',
        marginBottom: 15,
        overflow: 'hidden',
    },
    compactView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#fff',
    },
    orderIdText: { fontSize: 18, fontWeight: 'bold', color: '#000' },
    orderSummaryText: { fontSize: 14, color: '#555', marginTop: 4 },
    caret: { fontSize: 20, color: '#4A76C0' },
    expandedView: {
        padding: 15,
        borderTopWidth: 2,
        borderColor: '#000',
        backgroundColor: '#f5f5f5',
    },
    itemsHeaderText: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
    itemDetailText: { fontSize: 14, color: '#333' },
    detailedItemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 6,
        padding: 8,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd'
    },
    orderItemImage: {
        width: 50,
        height: 50,
        resizeMode: 'contain',
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4
    },
    orderItemInfo: { flex: 1 },
    orderItemTitle: { fontSize: 14, fontWeight: 'bold', color: '#000', marginBottom: 2 },
    actionRow: {
        marginTop: 15,
        alignItems: 'center',
    },
    actionButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#000',
        width: '100%',
        alignItems: 'center',
        flexDirection: 'row', 
        justifyContent: 'center',
    },
    payButton: { backgroundColor: '#FFB81C' },
    receiveButton: { backgroundColor: '#4A76C0' },
    buttonIconDark: {
        width: 18,
        height: 18,
        marginRight: 8,
        resizeMode: 'contain',
        tintColor: '#000', 
    },
    buttonText: { fontWeight: 'bold', fontSize: 16, color: '#000' },
    completedText: { fontWeight: 'bold', fontSize: 16, color: '#2e7d32', marginTop: 10 }
});

export default MyOrdersScreen;