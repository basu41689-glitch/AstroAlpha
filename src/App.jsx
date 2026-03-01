import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

function App() {
  const [stocks, setStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState("");
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    fetchStocks();
  }, []);

  async function fetchStocks() {
    const { data, error } = await supabase
      .from("AstroAlpha")
      .select("*");

    if (error) {
      console.log("Error fetching stocks:", error);
    } else {
      setStocks(data);
    }
  }

  async function generatePrediction() {
    if (!selectedStock) {
      alert("Please select a stock");
      return;
    }

    // Dummy AI logic (temporary)
    const randomPrice = (Math.random() * 1000 + 100).toFixed(2);
    const randomConfidence = (Math.random() * 20 + 75).toFixed(1);

    setPrediction({
      price: randomPrice,
      confidence: randomConfidence,
    });

    const { error } = await supabase.from("predictions").insert([
      {
        stock_symbol: selectedStock,
        predicted_price: randomPrice,
        confidence: randomConfidence,
      },
    ]);

    if (error) {
      console.log("Insert error:", error);
    }
  }

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h1>AstroAlpha 🇮🇳 AI Stock Predictor</h1>

      <select
        value={selectedStock}
        onChange={(e) => setSelectedStock(e.target.value)}
      >
        <option value="">Select Stock</option>
        {stocks.map((stock) => (
          <option key={stock.id} value={stock.symbol}>
            {stock.symbol} - {stock.name}
          </option>
        ))}
      </select>

      <br /><br />

      <button onClick={generatePrediction}>
        Predict
      </button>

      {prediction && (
        <div style={{ marginTop: "20px" }}>
          <h3>Predicted Price: ₹{prediction.price}</h3>
          <p>Confidence: {prediction.confidence}%</p>
        </div>
      )}
    </div>
  );
}

export default App;