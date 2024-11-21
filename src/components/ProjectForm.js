// components/ProjectForm.js
import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  Text,
  Image,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator
} from "react-native";
import { db } from "../../firebaseConfig";
import { addDoc, collection } from "firebase/firestore";
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
import { es } from 'date-fns/locale';

const ProjectForm = ({ route }) => {
  const [formData, setFormData] = useState({
    nombreProyecto: "",
    descripcion: "",
    cantidad: "",
    precioProducto: "",
    nombresCliente: "",
    apellidosCliente: "",
    telefonoCliente: "",
    imageUri: null,
    estado: "En proceso",
    inicioProyecto: "",
    finalProyecto: ""
  });

  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(false);

  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const seleccionarImagen = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso denegado", "Se requiere acceso a la galería para seleccionar una imagen.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFormData(prev => ({ ...prev, imageUri: result.assets[0].uri }));
      }
    } catch (error) {
      console.error("Error al seleccionar imagen:", error);
      Alert.alert("Error", "No se pudo seleccionar la imagen");
    }
  };

  const handleSubmit = async () => {
    if (!formData.nombreProyecto || !formData.descripcion || !formData.precioProducto || !formData.nombresCliente || !formData.apellidosCliente || !formData.telefonoCliente || !formData.inicioProyecto || !formData.finalProyecto) {
      Alert.alert("Error", "Por favor, complete todos los campos obligatorios.");
      return;
    }

    setIsLoading(true);

    try {
      await addDoc(collection(db, "carpinteria"), formData);
      Alert.alert("Éxito", "Proyecto registrado con éxito.");
      navigation.navigate('HomeScreen');
    } catch (error) {
      console.error("Error al guardar el proyecto:", error);
      Alert.alert("Error", "No se pudo guardar el proyecto.");
    } finally {
      setIsLoading(false);
    }
  };

  const getPermissionAsync = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Lo sentimos, necesitamos permisos de acceso a la galería para hacer esto!');
      }
    }
  };

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(false);
    setDate(currentDate);
    const formattedDate = format(currentDate, 'yyyy-MM-dd', { locale: es });
    setFormData({...formData, inicioProyecto: formattedDate});
  };

  const showDatepicker = () => {
    setShow(true);
  };

  useEffect(() => {
    getPermissionAsync();
  }, []);

  const DateInput = ({ label, value, onConfirm }) => {
    const [show, setShow] = useState(false);
    const [date, setDate] = useState(new Date());

    const onChange = (event, selectedDate) => {
      const currentDate = selectedDate || date;
      setShow(false);
      setDate(currentDate);
      const formattedDate = format(currentDate, 'd MMMM yyyy', { locale: es });
      onConfirm(formattedDate);
    };

    return (
      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={() => setShow(true)} style={{ flex: 1 }}>
          <TextInput
            style={styles.input}
            editable={false}
            placeholder={label}
            value={value}
          />
        </TouchableOpacity>
        <Icon name="date-range" size={20} color="#666" style={styles.inputIcon} />
        {show && (
          <DateTimePicker
            testID="dateTimePicker"
            value={date}
            mode="date"
            display="default"
            onChange={onChange}
          />
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.section}>
            <Text style={styles.header}>Datos del Cliente</Text>
            <View style={styles.inputContainer}>
              <Icon name="person" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.nombresCliente}
                onChangeText={text => handleChange('nombresCliente', text)}
                placeholder="Nombres del cliente"
              />
            </View>
            <View style={styles.inputContainer}>
              <Icon name="person-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.apellidosCliente}
                onChangeText={text => handleChange('apellidosCliente', text)}
                placeholder="Apellidos del cliente"
              />
            </View>
            <View style={styles.inputContainer}>
              <Icon name="phone" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.telefonoCliente}
                onChangeText={text => handleChange('telefonoCliente', text)}
                placeholder="Teléfono del cliente"
                keyboardType="phone-pad"
              />
            </View>
          </View>
          <View style={styles.section}>
            <Text style={styles.header}>Datos del Producto</Text>
            <TouchableOpacity 
              onPress={seleccionarImagen} 
              style={styles.imageUploader}
            >
              {formData.imageUri ? (
                <View style={styles.imageContainer}>
                  <Image 
                    source={{ uri: formData.imageUri }} 
                    style={styles.imagePreview} 
                  />
                  <View style={styles.imageOverlay}>
                    <Icon name="edit" size={24} color="#fff" />
                    <Text style={styles.changeImageText}>Cambiar imagen</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.imageUploadButton}>
                  <Icon name="photo-camera" size={30} color="#666" />
                  <Text style={styles.imageUploaderText}>Cargar Imagen</Text>
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.inputContainer}>
              <Icon name="business" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.nombreProyecto}
                onChangeText={text => handleChange('nombreProyecto', text)}
                placeholder="Nombre del proyecto"
              />
            </View>
            <View style={styles.inputContainer}>
              <Icon name="description" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.descripcion}
                onChangeText={text => handleChange('descripcion', text)}
                placeholder="Descripción del proyecto"
              />
            </View>
            <View style={styles.inputContainer}>
              <Icon name="format-list-numbered" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.cantidad}
                onChangeText={text => handleChange('cantidad', text)}
                placeholder="Cantidad"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>C$</Text>
              <TextInput
                style={styles.input}
                value={formData.precioProducto}
                onChangeText={text => handleChange('precioProducto', text)}
                placeholder="Precio del producto"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.section}>
              <Text style={styles.header}>Fechas del Proyecto</Text>
              <DateInput
                label="Fecha de inicio (DD/MM/AAAA)"
                value={formData.inicioProyecto}
                onConfirm={(date) => setFormData({...formData, inicioProyecto: date})}
              />
              <DateInput
                label="Fecha de finalización (DD/MM/AAAA)"
                value={formData.finalProyecto}
                onConfirm={(date) => setFormData({...formData, finalProyecto: date})}
              />
            </View>
          </View>
          {isLoading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <Button title="Registrar Proyecto" onPress={handleSubmit} />
          )}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  inputIcon: {
    marginLeft: 10,
  },
  input: {
    flex: 1,
    height: 25,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  section: {
    marginBottom: 20,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  changeImageText: {
    color: '#fff',
    marginTop: 5,
    fontSize: 16,
  },
  imageUploader: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e9e9e9',
    height: 150,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 10,
    overflow: 'hidden',
  },
  imageUploadButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  imageUploaderText: {
    color: '#000',
    fontSize: 16,
    marginTop: 8,
  },
});

export default ProjectForm;
