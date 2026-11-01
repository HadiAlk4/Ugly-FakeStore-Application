import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Image, TouchableOpacity, ScrollView } from 'react-native';
import ImageBackground from '../components/ImageBackground';
import { showAlert } from '../utils/alert';

import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/cartSlice';

import { getProduct, imageUri } from '../api/demoApi';

const DetailedProductListScreen = ({route, navigation}) => {
    const [detailedItems, setDetailedItems] = useState(null);
    const [loading, setLoading] = useState(true);
    const {productId} = route.params;

    const dispatch = useDispatch(); 

    const fetchDetailedItems = async () => {
        try{
            const data = await getProduct(productId);
            setDetailedItems(data);
            setLoading(false);
        } catch (error){
            console.log("error fetching detailedItems", error);
            setLoading(false)
        };
    };

    useEffect(() => {
        fetchDetailedItems();
    }, []);

    return (
        <View style={DetailedProductListScreenStyles.container}>
            <ImageBackground source={require('../assets/backgrounds/bubblesBG.png')} resizeMode="repeat" style={DetailedProductListScreenStyles.TopTitle}>
                <Text style={DetailedProductListScreenStyles.HeaderTitleText}>Product{"\n"} Details </Text>
            </ImageBackground> 

            <ImageBackground style={DetailedProductListScreenStyles.MainBG}> 
                {loading ? (
                    <ActivityIndicator size="large" color="#000" style={{ marginTop: 50 }}/> 
                ) : !detailedItems ? (
                    <Text style={DetailedProductListScreenStyles.TitleText}>Could not load this product.</Text>
                ) : (
                    <ScrollView contentContainerStyle={DetailedProductListScreenStyles.scrollContent} showsVerticalScrollIndicator={false}>
                        <Image source={{ uri: imageUri(detailedItems.image) }} style={DetailedProductListScreenStyles.fullImage} />

                        <Text style={DetailedProductListScreenStyles.TitleText}> Name: {detailedItems.title} </Text>
                        
                        <Text style={DetailedProductListScreenStyles.RCPText}> 
                            Rate: {detailedItems.rating.rate}     Count: {detailedItems.rating.count}     Price: ${detailedItems.price.toFixed(2)}
                        </Text>

                        <View style={DetailedProductListScreenStyles.buttonRow}>
                            <TouchableOpacity style={[DetailedProductListScreenStyles.button, DetailedProductListScreenStyles.backBtn]} onPress={() => navigation.goBack()}>
                                <Image source={require('../assets/Items/back.png')} style={DetailedProductListScreenStyles.buttonIcon} />
                                <Text style={DetailedProductListScreenStyles.buttonText}>Back</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[DetailedProductListScreenStyles.button, DetailedProductListScreenStyles.cartBtn]} 
                                onPress={() => {
                                    // Cart is saved to the browser automatically (see redux/store.js)
                                    dispatch(addToCart(detailedItems));
                                    showAlert("Shopping Cart", "Added to Cart!");
                                }}
                            >
                                <Image source={require('../assets/Items/cart.png')} style={DetailedProductListScreenStyles.buttonIcon} />
                                <Text style={DetailedProductListScreenStyles.buttonText}>Add to Cart</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={DetailedProductListScreenStyles.DescriptionText}>
                            Description: {"\n"}{detailedItems.description}
                        </Text>
                    </ScrollView>
                )}
            </ImageBackground>
        </View>
    );
};

const DetailedProductListScreenStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    MainBG: {
        flex: 3,
        width: '100%',
        backgroundColor: '#FFB81C', 
    },
    scrollContent: {
        alignItems: 'center',
        paddingVertical: 20,
        paddingBottom: 40,
    },
    TopTitle: {
        flex: 0.5,
        justifyContent: 'center',
        paddingTop: 45, 
        borderBottomWidth: 5,
        borderBottomColor: '#FDF5D6',
        alignItems: 'center',
    },
    HeaderTitleText: {
        color: '#d5dfff',
        fontSize: 35,
        fontWeight: 'bold',
        textShadowColor: 'rgb(255, 0, 0)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 5,
        textAlign: 'center'
    },
    fullImage: {
        width: '90%',
        height: 200,
        backgroundColor: '#aeaeac',
        borderRadius: 20,
        resizeMode: 'contain',
        borderWidth: 3,
        borderColor: '#000000',
        marginBottom: 20,
    },
    TitleText: {
        width: '90%',
        fontSize: 18,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 5,
        color: '#000000',
        textAlign: 'center',
        marginBottom: 20,
    },
    RCPText: {
        width: '90%',
        backgroundColor: '#FDF5D6',
        borderRadius: 20,
        borderWidth: 3,
        borderColor: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 5,
        color: '#000000',
        paddingHorizontal: 10,
        paddingVertical: 10,
        textAlign: 'center'
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '90%',
        marginTop: 20,
        marginBottom: 20,
    },
    button: {
        width: '48%', 
        height: 50,
        borderRadius: 15,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#ffffff',
    },
    buttonIcon: {
        width: 30,
        height: 30,
        marginRight: 8,
        resizeMode: 'contain',
    },
    backBtn: {
        backgroundColor: '#4A76C0', 
    },
    cartBtn: {
        backgroundColor: '#3498DB', 
    },
    buttonText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    DescriptionText: {
        width: '90%',
        backgroundColor: '#FDF5D6',
        borderRadius: 20,
        borderWidth: 3,
        borderColor: '#ffffff',
        fontSize: 14,
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 5,
        color: '#000000',
        paddingHorizontal: 15,
        paddingVertical: 15,
    },
});

export default DetailedProductListScreen;