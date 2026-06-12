import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, View, ImageBackground, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const ProductListScreen = ({ route, navigation }) => {
    const [productItems, setProductItems] = useState([]);
    const [Loading, setLoading] = useState(true);
    const {categoryName} = route.params;

    const fetchproductItems = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/category/${categoryName}`);
        
        // Always check if the response is okay before parsing JSON
        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }

        const data = await response.json();
        setProductItems(data);
        setLoading(false);
    } catch (error) {
        // Do NOT use 'response' here, only 'error'
        console.log("error fetching categoryProducts:", error.message);
        setLoading(false);
    }
};

    useEffect(() => {
        fetchproductItems();
    }, []);

    return (
        <View style={ProductListScreenStyles.container}>
            <ImageBackground
                source={require('../assets/backgrounds/wavyBG.png')} 
                resizeMode="repeat" 
                style={ProductListScreenStyles.TopTitle}
            >
                <Text style={ProductListScreenStyles.TitleText}>
                    {categoryName.toUpperCase()}
                </Text>
            </ImageBackground>

            <ImageBackground
                source={require('../assets/backgrounds/linesBG.png')} 
                resizeMode="repeat" 
                style={ProductListScreenStyles.MainBG}
            >
                {Loading ? (
                    <ActivityIndicator size="large" color="#FDF5D6" style={{ marginTop: 50 }}/> 
                ) : (
                    <>
                        <FlatList
                            data={productItems}
                            keyExtractor={(item) => item.id.toString()}
                            contentContainerStyle={{ paddingBottom: 100 }}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('DetailedProductList', { productId: item.id })}
                                    style={{ margin: 10 }} 
                                >
                                    <ImageBackground
                                        source={require('../assets/backgrounds/texture.png')} 
                                        resizeMode="cover"
                                        style={ProductListScreenStyles.productCard} 
                                    >
                                        <Image source={{ uri: `${API_BASE_URL}${item.image}` }} style={ProductListScreenStyles.productImage} />
                                        {/* <Image source={{ uri: `http://10.128.169.244:3000${item.image}` }} style={ProductListScreenStyles.productImage} /> */}
                                        <View style={{ flex: 1, justifyContent: 'center', paddingRight: 10 }}>
                                            <Text style={ProductListScreenStyles.itemTitle} >{item.title}</Text>
                                            <Text style={ProductListScreenStyles.itemPrice}>Price: ${item.price}</Text>
                                        </View>
                                    </ImageBackground>
                                </TouchableOpacity>                    
                            )}
                        />

                        <View style={ProductListScreenStyles.fixedButtonContainer}>
                            <TouchableOpacity 
                                style={ProductListScreenStyles.backButton} 
                                onPress={() => navigation.goBack()}
                            >
                                <Image source={require('../assets/Items/back.png')} style={ProductListScreenStyles.buttonIcon} />
                                <Text style={ProductListScreenStyles.backButtonText}>Back</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </ImageBackground>
        </View>
    );
};

const ProductListScreenStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    MainBG: {
        flex: 3,
        width: '100%',
    },
    TopTitle: {
        flex: 0.5,
        justifyContent: 'flex-end',
        borderBottomWidth: 5,
        alignItems: 'center',
        paddingBottom: 45,
    },
    TitleText: {
        fontSize: 38,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 5,
        color: '#FDF5D6'
    },
    productCard: {
        flexDirection: 'row',
        backgroundColor: 'white',
        margin: 10,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#9b9b9b',
        overflow: 'hidden', 
        alignItems: 'center',
        height: 120, 
    },
    productImage: {
        width: 100,
        height: '100%',
        resizeMode: 'contain',
    },
    itemTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#d5dfff',
        marginBottom: 5,
        textShadowColor: '#000000', 
        textShadowOffset: { width: 2, height: 2 }, 
        textShadowRadius: 4, 
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#ffffff',
        textShadowColor: '#000000', 
        textShadowOffset: { width: 2, height: 2 }, 
        textShadowRadius: 4, 
    },
    fixedButtonContainer: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    backButton: {
    backgroundColor: '#4A76C0', 
    width: 150,
    height: 50,
    flexDirection: 'row', 
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000000',
},
    backButtonText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 20,
    },
    buttonIcon: {
    width: 40,
    height: 40,
    marginRight: 8,
    resizeMode: 'contain',
},
});

export default ProductListScreen;
