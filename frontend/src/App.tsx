import { useEffect, useState } from "react";

function App() {
  const [spots, setSpots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/map")   // call backend
      .then((res) => res.json())
      .then((data) => {
        setSpots(data.spots || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching spots:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">Trending Spots</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="space-y-2">
          {spots.map((spot, idx) => (
            <li key={idx} className="p-2 bg-gray-100 rounded shadow">
              {spot}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
