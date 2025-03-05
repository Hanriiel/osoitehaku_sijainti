import { StyleSheet, TextInput, Text, View, Alert, Pressable } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export default function App() {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [mapRegion, setMapRegion] = useState(null);

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    console.log(status)
    if (status !== 'granted') {
      Alert.alert('No permission to get location')
      return;
    }
    let location = await Location.getCurrentPositionAsync({ accuracy: Location.LocationAccuracy.High });
    const { latitude, longitude } = location.coords;

    setMapRegion({
      latitude,
      longitude,
      latitudeDelta: 0.0322,
      longitudeDelta: 0.0221
    });

  }

  useEffect(() => { getLocation(); }, []);

  const getAddressLocation = async () => {
    try {
      const encodedAddress = encodeURIComponent(address);
      const apiUrl = `https://geocode.maps.co/search?q=${encodedAddress}&api_key=67c354afcbbca555489980xad81d342`;

      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setMapRegion({
          latitude: lat,
          longitude: lon,
          latitudeDelta: 0.0322,
          longitudeDelta: 0.0221
        });
        setLocation(`${lat}, ${lon}`)
      } else {
        Alert.alert('Location not found')
      }
    } catch (error) {
      console.error('Error fetching location: ', error)
      Alert.alert('Error fetching location')
    }
  };


  return (
    <View style={styles.container}>
      {mapRegion ? (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={mapRegion}
            onRegionChangeComplete={(region) => setMapRegion(region)}
          >
            <Marker
              coordinate={{
                latitude: mapRegion.latitude,
                longitude: mapRegion.longitude
              }}
              title="Location"
            />
          </MapView>
        </View>
      ) : (
        <Text>Loading map...</Text>
      )}
      <View style={styles.inputContainer}>
        <TextInput style={styles.input}
          value={address}
          onChangeText={setAddress}
          placeholder='Address'
        />
        <Pressable
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: pressed ? '#10507f' : '#1c8adb' },
          ]}
          onPress={() => getAddressLocation()}
        >
          <Text style={styles.buttonText}>SHOW</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center'
  },
  mapContainer: {
    flex: 1,
    width: '100%',
  },
  map: {
    flex: 1,
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'white',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 10,
    paddingBottom: 15,
    paddingHorizontal: 20
  },
  input: {
    borderWidth: 1,
    borderColor: 'black',
    padding: 10,
    marginBottom: 10,
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 5
  },
  button: {
    width: '100%',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5

  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});
