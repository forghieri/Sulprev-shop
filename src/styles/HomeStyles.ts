import { StyleSheet, Platform } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  productCard: {
    backgroundColor: "#f8f8f8",
    margin: 10,
    padding: 10,
    overflow: "hidden",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  imageContainer: {
    width: "100%",
    height: "85%",
    alignItems: "center",
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: 10,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 5,
    flex: 1,
  },
  textContainer: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "left",
  },
  productPrice: {
    fontSize: 14,
    color: "green",
    fontWeight: "bold",
    textAlign: "left",
  },
  menuButton: {
    padding: 5,
  },

  /** ========== MODAL ========== */
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    height: "80%",
    backgroundColor: "#fff",
    borderRadius: 15,
    overflow: "hidden",
    alignItems: "center",
  },
  imageScroll: {
    // Estilo base
  },
  modalImage: {
    width: "100%",
    height: "100%",
    resizeMode: "stretch",
  },
  descriptionCard: {
    backgroundColor: "#fff",
    padding: 15,
  },
  descriptionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "left",
    marginBottom: 10,
  },
  descriptionPrice: {
    fontSize: 18,
    color: "green",
    fontWeight: "bold",
    textAlign: "left",
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: "#333",
    textAlign: "left",
    lineHeight: 20,
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 40,
    left: 20,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 50,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});