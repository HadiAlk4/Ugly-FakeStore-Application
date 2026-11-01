// On web, react-native-web sizes a background image to its natural pixel size
// unless told otherwise, leaving gaps. Make it always fill its container.
import React from 'react';
import { ImageBackground as RNImageBackground } from 'react-native';

export default function ImageBackground({ imageStyle, ...props }) {
    return <RNImageBackground {...props} imageStyle={[{ width: '100%', height: '100%' }, imageStyle]} />;
}
