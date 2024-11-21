// components/ProjectList.js
import React, { useState, useEffect } from "react";
import { FlatList, StyleSheet, TouchableOpacity, Text, View, Image, Alert } from "react-native";
import { db } from "../../firebaseConfig";
import { collection, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import * as ImagePicker from 'expo-image-picker';

const ProjectList = ({ navigation }) => {
  const [projects, setProjects] = useState([]);
  const [imageUri, setImageUri] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "carpinteria"), (querySnapshot) => {
      const projectList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log(projectList);
      setProjects(projectList);
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.cancelled) {
      setImageUri(result.uri);
    }
  };

  const handleDelete = () => {
    setImageUri(null); // Elimina la imagen actual
  };

  const handleUpdate = (projectId) => {
    navigation.navigate('ProjectUpdate', { projectId });
  };

  const deleteProject = async (projectId) => {
    Alert.alert(
      "Confirmación",
      "¿Está seguro de eliminar el proyecto?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        { text: "Eliminar", onPress: () => performDeletion(projectId) }
      ]
    );
  };

  const performDeletion = async (projectId) => {
    const projectRef = doc(db, "carpinteria", projectId);
    try {
      await deleteDoc(projectRef);
      setProjects(projects.filter(project => project.id !== projectId));
      alert("Proyecto eliminado correctamente.");
    } catch (error) {
      alert("Error al eliminar el proyecto: ", error);
    }
  };

  const navigateToProjectUpdate = (projectId) => {
    navigation.navigate('ProjectUpdate', { projectId });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => navigateToProjectUpdate(item.id)}>
      {item.imageUri ? (
        <Image source={{ uri: item.imageUri }} style={styles.image} />
      ) : (
        <Text>No image selected</Text>
      )}
      <Text style={styles.itemTitle}>{item.nombreProyecto}</Text>
      <Text style={styles.itemDetail}>Descripción: {item.descripcion}</Text>
      <Text style={[styles.itemDetail, styles.estado, item.estado === 'Terminado' ? styles.terminado : styles.enProceso]}>
        Estado: {item.estado}
      </Text>
      <Text style={styles.itemDetail}>Cantidad: {item.cantidad}</Text>
      <Text style={styles.itemDetail}>Precio: C${item.precioProducto}</Text>
      <View style={styles.clientInfo}>
        <Text style={styles.clientText}>Cliente: {item.nombresCliente} {item.apellidosCliente}</Text>
        <Text style={styles.clientText}>Telefono: {item.telefonoCliente}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={() => handleUpdate(item.id)} style={styles.button}>
          <Text>Actualizar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteProject(item.id)} style={styles.button}>
          <Text>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={projects}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      style={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  itemContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 10,
    backgroundColor: '#fff',
    alignItems: 'flex-start',
    borderRadius: 15,
  },
  image: {
    width: 280,
    height: 140,
    resizeMode: 'cover',
    borderRadius: 15,
    marginBottom: 10,
  },
  itemTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  itemDetail: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 5,
  },
  estado: {
    fontWeight: 'bold',
    color: '#fff',
    padding: 5,
    borderRadius: 5,
  },
  terminado: {
    backgroundColor: 'green',
  },
  enProceso: {
    backgroundColor: '#F24151',
  },
  clientInfo: {
    marginTop: 5,
    marginBottom: 10,
  },
  clientText: {
    fontSize: 15,
    color: 'darkblue',
    marginBottom: 3,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  button: {
    marginHorizontal: 10,
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
  }
});

export default ProjectList;