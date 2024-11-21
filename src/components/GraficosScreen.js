import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Button, Alert, ScrollView } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { captureRef } from "react-native-view-shot";
import { jsPDF } from "jspdf";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

const GraficosScreen = () => {
  const [data, setData] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const chartRef = useRef();



  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "carpinteria"));
        const estados = { "En proceso": 0, "Terminado": 0 };
        const detallesProyectos = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          detallesProyectos.push(data);
          if (data.estado === "En proceso") estados["En proceso"]++;
          else if (data.estado === "Terminado") estados["Terminado"]++;
        });

        const colores = ["#FF6384", "#36A2EB"];
        const chartData = [
          {
            name: "En Proceso",
            population: estados["En proceso"],
            color: colores[0],
            legendFontColor: "#333",
            legendFontSize: 15,
          },
          {
            name: "Terminado",
            population: estados["Terminado"],
            color: colores[1],
            legendFontColor: "#333",
            legendFontSize: 15,
          },
        ];
        setData(chartData);
        setProyectos(detallesProyectos);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        Alert.alert("Error", "No se pudieron cargar los datos.");
      }
    };
    cargarDatos();
  }, []);

  const generarPDF = async () => {
    try {
      if (!chartRef.current) throw new Error("Referencia al gráfico no disponible.");

      const uri = await captureRef(chartRef.current, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });

      const doc = new jsPDF();
      doc.text("Cantidad de Proyectos por Estado", 10, 10);

      const chartImage = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      doc.addImage(`data:image/png;base64,${chartImage}`, "PNG", 10, 20, 180, 100);

      // Añadir información del proyecto
      doc.text("Detalles del Proyecto:", 10, 130);
      let y = 140; // Iniciar y después del título de los detalles del proyecto
      proyectos.forEach(proyecto => {
        if (y > 280) { // Verificar si y excede el límite de la página
          doc.addPage();
          y = 10; // Restablecer y al inicio de la nueva página
        }
        doc.text(`Nombre del Proyecto: ${proyecto.nombreProyecto}`, 10, y);
        y += 10;
        doc.text(`Inicio del Proyecto: ${proyecto.inicioProyecto}`, 10, y);
        y += 10;
        doc.text(`Final del Proyecto: ${proyecto.finalProyecto}`, 10, y);
        y += 10;
        doc.text(`Precio: ${proyecto.precioProducto}`, 10, y);
        y += 10;
        doc.text(`Cliente: ${proyecto.nombresCliente} ${proyecto.apellidosCliente}`, 10, y);
        y += 10;
        doc.text(`Teléfono: ${proyecto.telefonoCliente}`, 10, y);
        y += 10;
        doc.text(`Estado: ${proyecto.estado}`, 10, y);
        y += 20; // Añadir espacio entre proyectos
      });

      const fileUri = `${FileSystem.documentDirectory}proyectos_por_estado.pdf`;
      const pdfBase64 = doc.output("datauristring").split(",")[1];
      await FileSystem.writeAsStringAsync(fileUri, pdfBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      Alert.alert("Error", "No se pudo generar o compartir el PDF.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cantidad de Proyectos por Estado</Text>
      <View style={styles.chartContainer} ref={chartRef} collapsable={false}>
        <PieChart
          data={data}
          width={350}
          height={220}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
          hasLegend={true}
        />
      </View>
      <Button title="Guardar Gráfico como PDF" onPress={generarPDF} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8f8f8",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  chartContainer: {
    marginBottom: 24,
  },
  infoContainer: {
    marginTop: 16,
    alignItems: "flex-start",
    width: "100%",
    paddingHorizontal: 16,
  },
  infoText: {
    fontSize: 14,
    color: "#333",
    marginVertical: 2,
  },
});

export default GraficosScreen;
