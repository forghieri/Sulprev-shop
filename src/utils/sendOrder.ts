
// src/utils/sendOrder.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

// Tipo para o pedido (baseado na estrutura do Shop.tsx)
// src/utils/sendOrder.ts (trecho ajustado)
type Order = {
    id: string;
    items: Array<{
      id: string;
      name: string;
      price: string | number;
      quantity: number;
      images: string[];
      description: string;
      category: string;
    }>;
    total: number;
    date: string;
    customerName: string; // Adicionado
    customerCPF: string;  
  };

// Função para enviar o pedido à API
const sendOrderToApi = async (order: Order): Promise<boolean> => {
  try {
    // Substitua pela sua URL de API real
    const response = await fetch("https://sua-api.com/pedidos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(order),
    });

    if (!response.ok) {
      throw new Error("Erro ao enviar pedido à API");
    }

    console.log("Pedido enviado com sucesso:", order);
    return true;
  } catch (error) {
    console.error("Erro ao enviar pedido à API:", error);
    return false;
  }
};

// Função para salvar o pedido localmente
const saveOrderLocally = async (order: Order) => {
  try {
    const pendingOrders = await AsyncStorage.getItem("pendingOrders");
    const orders = pendingOrders ? JSON.parse(pendingOrders) : [];
    orders.push(order);
    await AsyncStorage.setItem("pendingOrders", JSON.stringify(orders));
    console.log("Pedido salvo localmente:", order);
  } catch (error) {
    console.error("Erro ao salvar pedido localmente:", error);
  }
};

// Função para tentar enviar pedidos pendentes
const sendPendingOrders = async () => {
  try {
    const pendingOrders = await AsyncStorage.getItem("pendingOrders");
    if (!pendingOrders) return;

    const orders: Order[] = JSON.parse(pendingOrders);
    if (orders.length === 0) return;

    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      console.log("Sem conexão, mantendo pedidos pendentes.");
      return;
    }

    const successfulOrders: string[] = [];
    for (const order of orders) {
      const success = await sendOrderToApi(order);
      if (success) {
        successfulOrders.push(order.id);
      }
    }

    const remainingOrders = orders.filter(
      (order) => !successfulOrders.includes(order.id)
    );
    await AsyncStorage.setItem("pendingOrders", JSON.stringify(remainingOrders));
    console.log("Pedidos pendentes restantes:", remainingOrders);
  } catch (error) {
    console.error("Erro ao enviar pedidos pendentes:", error);
  }
};

// Função principal para enviar ou salvar o pedido
export const sendOrder = async (order: Order) => {
  const netInfo = await NetInfo.fetch();
  if (netInfo.isConnected) {
    const success = await sendOrderToApi(order);
    if (success) return;
  }

  await saveOrderLocally(order);

  const unsubscribe = NetInfo.addEventListener((state) => {
    if (state.isConnected) {
      console.log("Conexão restaurada, tentando enviar pedidos pendentes...");
      sendPendingOrders();
    }
  });

  setTimeout(() => unsubscribe(), 60000); // Limite de 1 minuto
};

// Inicializa a verificação de pedidos pendentes
export const initPendingOrdersCheck = () => {
  NetInfo.fetch().then((state) => {
    if (state.isConnected) {
      sendPendingOrders();
    }
  });
};