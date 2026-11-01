import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import ImageBackground from '../components/ImageBackground';

const SplashScreen = ({ navigation }) => {

    useEffect(() => {
        const timer = setTimeout(() => {
            navigation.replace('MainTabs'); 
        }, 3000);

        return () => clearTimeout(timer);
    }, [navigation]);

    return (
        <View style={styles.container}>
            <ImageBackground 
                source={require('../assets/backgrounds/splash-screen.png')} 
                style={styles.background}
                resizeMode="cover" 
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
    }
});

export default SplashScreen;