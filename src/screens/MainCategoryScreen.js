import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, View, ImageBackground, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';

import { useFonts } from 'expo-font'

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const MainCategoryScreen = ({ navigation }) => {

    const [fontsLoaded] = useFonts({
        'PeaceMarker': require('../assets/Fonts/ManlineSlabs-xRWVj.ttf'),
    });
    const [categories, setCategories] = useState([]);
    const [Loading, setLoading] = useState(true);

    const FetchCategories = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/products/categories`);
            const data = await response.json();
            setCategories(data);
            setLoading(false);
        } catch (error) {
            console.log("Error fetching categories:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        FetchCategories();
    }, []);

        if(!fontsLoaded){
        return null;
    }

  return (
    <View style={styles.container}>

        <View // TopTitle
        style={styles.TopTitle}> 
        <Text style={styles.TitleText}
        >Categories
        </Text>

        </View>


      <ImageBackground // MainBG
        source={require('../assets/backgrounds/architect.png')} 
        resizeMode="repeat" 
        style={styles.MainBG}
      >

        {Loading ? (
            <ActivityIndicator size="large" color="#FDF5D6"/>
        ) : (
            <View style={styles.Grid}>
                {categories.map((item, index) => (
                    <TouchableOpacity 
                    key={index}
                    onPress={() => navigation.navigate('ProductList', {categoryName: item})}
                    style={{ width: '100%', alignItems: 'center' }} 
                    >
                    <ImageBackground 
                    source={require('../assets/backgrounds/texture.png')} 
                    resizeMode="repeat" 
                    style={styles.categoryBox}
                    imageStyle=
                        {{ 
                        width: '100%', 
                        height: '100%',
                        }}
                    >
                    <Text style={styles.boxText}>{item}</Text>
                    </ImageBackground>
                    </TouchableOpacity>
                ))}
            </View>
        )}
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  TopTitle: {
    flex: 0.7,
    justifyContent: 'flex-end',
    borderBottomWidth: 5,
    borderBottomColor: '#FDF5D6',
    backgroundColor: '#C8CD60', // #FFB81C
    alignItems: 'center',
    paddingBottom: 35,
  },
  TitleText: {
    fontFamily: 'PeaceMarker',
    color: '#f3dddd',
    fontSize: 65,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },

  MainBG: {
    flex:3,
  },

  Grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingTop: 20,
  },

  categoryBox: {
    width: '82%',
    height: 100,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    overflow: 'hidden', 
    borderWidth: 2,
    borderColor: '#FDF5D6',
  },
  boxText: {
    fontWeight: 'bold',
    fontSize: 35,
    color: '#FFB81C',
    fontFamily: 'PeaceMarker',
  }

});

export default MainCategoryScreen;
