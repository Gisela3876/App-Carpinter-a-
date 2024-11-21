// components/ProjectUpdate.js
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, ScrollView, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { db } from "../../firebaseConfig";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { utcToZonedTime } from 'date-fns-tz';
import * as ImagePicker from 'expo-image-picker';

const ProjectUpdate = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { projectId } = route.params;
  const [formData, setFormData] = useState({
    nombresCliente: '',
    apellidosCliente: '',
    telefonoCliente: '',
    nombreProyecto: '',
    descripcion: '',
    cantidad: '',
    precioProducto: '',
    estado: '',
    imageUri: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [dateInicio, setDateInicio] = useState(new Date());
  const [showInicio, setShowInicio] = useState(false);
  const [dateFinal, setDateFinal] = useState(new Date());
  const [showFinal, setShowFinal] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      const docRef = doc(db, "carpinteria", projectId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("Datos recuperados:", data);
        setFormData(prevState => ({
          ...prevState,
          ...data,
          inicioProyecto: data.inicioProyecto || '',
          finalProyecto: data.finalProyecto || ''
        }));
        console.log("Estado actualizado:", formData);
      } else {
        console.log("No such document!");
      }
    };
    fetchProject();
  }, [projectId]);

  const handleChange = (name, value) => {
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      let dataToUpdate = { ...formData };
      
      // Eliminamos campos undefined o null
      Object.keys(dataToUpdate).forEach(key => {
        if (dataToUpdate[key] === undefined || dataToUpdate[key] === null) {
          delete dataToUpdate[key];
        }
      });
      
      const docRef = doc(db, "carpinteria", projectId);
      await updateDoc(docRef, dataToUpdate);
      
      alert("Proyecto actualizado correctamente.");
      navigation.navigate('HomeScreen');
    } catch (error) {
      console.error("Error completo:", error);
      alert("Error al actualizar el proyecto. Por favor, intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const onChangeInicio = (event, selectedDate) => {
    const currentDate = selectedDate || dateInicio;
    setShowInicio(false);
    setDateInicio(currentDate);
    const formattedDate = format(currentDate, 'd MMMM yyyy', { locale: es });
    setFormData({...formData, inicioProyecto: formattedDate});
  };

  const onChangeFinal = (event, selectedDate) => {
    const currentDate = selectedDate || dateFinal;
    setShowFinal(false);
    setDateFinal(currentDate);
    const formattedDate = format(currentDate, 'd MMMM yyyy', { locale: es });
    setFormData({...formData, finalProyecto: formattedDate});
  };

  const validateFormData = () => {
    // Lista de campos que no deben estar vacíos
    const requiredFields = [
      'nombresCliente', 'apellidosCliente', 'telefonoCliente',
      'nombreProyecto', 'cantidad', 'precioProducto', 'estado',
      'inicioProyecto', 'finalProyecto'
    ];

    for (let field of requiredFields) {
      if (!formData[field] || formData[field].trim() === '') {
        // Retorna el nombre del campo que está vacío para mostrar un mensaje adecuado
        return field;
      }
    }

    // Si todos los campos están llenos, retorna null
    return null;
  };

  const handleDateChange = (date) => {
    // Suponiendo que `date` es el objeto Date obtenido del selector de fecha
    const timestamp = Timestamp.fromDate(date);
    // Actualiza el estado o maneja la lógica de guardado aquí
  };

  const formatDate = (timestamp) => {
    const date = timestamp.toDate(); // Convierte Timestamp a Date
    const timeZone = 'America/Costa_Rica'; // Ajusta a la zona horaria deseada
    const zonedDate = utcToZonedTime(date, timeZone);
    return format(zonedDate, 'd MMMM yyyy, p', { locale: es });
  };

  const seleccionarImagen = async () => {
    try {
      // Pedir permisos primero
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Se necesitan permisos para acceder a la galería');
        return;
      }

      // Abrir selector de imagen
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setFormData(prevState => ({
          ...prevState,
          imageUri: result.assets[0].uri
        }));
      }
    } catch (error) {
      console.error("Error al seleccionar imagen:", error);
      alert("Error al seleccionar la imagen");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Cliente Data Section */}
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
          {/* Project Data Section */}
          <View style={styles.section}>
            <Text style={styles.header}>Datos del Producto</Text>
            <TouchableOpacity 
              style={styles.imagePickerButton} 
              onPress={seleccionarImagen}
            >
              <Icon name="image" size={20} color="#666" style={styles.inputIcon} />
              <Text style={styles.imagePickerText}>
                {formData.imageUri ? 'Cambiar imagen' : 'Seleccionar imagen'}
              </Text>
            </TouchableOpacity>
            {formData.imageUri && (
              <Image 
                source={{ uri: formData.imageUri }} 
                style={styles.previewImage}
              />
            )}
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
            <View style={styles.radioContainer}>
              <TouchableOpacity
                style={[styles.radioButton, formData.estado === 'En proceso' && styles.radioButtonSelected]}
                onPress={() => handleChange('estado', 'En proceso')}
              >
                <Text style={[styles.radioText, formData.estado === 'En proceso' ? styles.radioTextSelected : styles.radioTextUnselected]}>En Proceso</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.radioButton, formData.estado === 'Terminado' && styles.radioButtonSelected]}
                onPress={() => handleChange('estado', 'Terminado')}
              >
                <Text style={[styles.radioText, formData.estado === 'Terminado' ? styles.radioTextSelected : styles.radioTextUnselected]}>Terminado</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                editable={false}
                placeholder="Fecha de inicio"
                value={formData.inicioProyecto}
              />
              <TouchableOpacity onPress={() => setShowInicio(true)} style={styles.iconContainer}>
                <Icon name="date-range" size={20} color="#666" />
              </TouchableOpacity>
              {showInicio && (
                <DateTimePicker
                  testID="dateTimePickerInicio"
                  value={dateInicio}
                  mode="date"
                  display="default"
                  onChange={onChangeInicio}
                />
              )}
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                editable={false}
                placeholder="Fecha de finalización"
                value={formData.finalProyecto}
              />
              <TouchableOpacity onPress={() => setShowFinal(true)} style={styles.iconContainer}>
                <Icon name="date-range" size={20} color="#666" />
              </TouchableOpacity>
              {showFinal && (
                <DateTimePicker
                  testID="dateTimePickerFinal"
                  value={dateFinal}
                  mode="date"
                  display="default"
                  onChange={onChangeFinal}
                />
              )}
            </View>
          </View>
          {isLoading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <Button title="Actualizar Proyecto" onPress={handleSubmit} />
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
    // No es necesario marginLeft si el ícono debe estar al final
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
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  radioButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#cccccc',
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  radioButtonSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#388E3C',
  },
  radioText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  radioTextSelected: {
    color: '#fff',
  },
  radioTextUnselected: {
    color: '#388E3C',
  },
  iconContainer: {
    padding: 2,
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  imagePickerText: {
    marginLeft: 10,
    color: '#666',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
    resizeMode: 'cover',
  },
});

export default ProjectUpdate;