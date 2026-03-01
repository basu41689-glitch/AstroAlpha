import { useEffect, useState } from "react";
import supabase from "./lib/supabase";

// The example below assumes a "users" table with the following schema:
//
//   CREATE TABLE users (
//     id serial PRIMARY KEY,
//     name text
//   );
//
// Create the table in the Supabase SQL editor or via the dashboard before
// running the app. You can also insert rows manually there to test.


function App() {
  const [name, setName] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from("users").select("*");
      if (error) {
        console.error("fetch error", error);
      } else {
        setUsers(data || []);
      }
    };

    fetchData();
  }, []);

  const addUser = async (e) => {
    e.preventDefault();
    if (!name) return;

    const { data, error } = await supabase.from("users").insert([{ name }]);
    if (error) {
      console.error("insert error", error);
    } else {
      setUsers((prev) => [...prev, ...data]);
      setName("");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Supabase Test App</h1>

      <form onSubmit={addUser} className="mb-4">
        <input
          className="border p-1 mr-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter name"
        />
        <button className="bg-blue-500 text-white px-3 py-1" type="submit">
          Add user
        </button>
      </form>

      <ul>
        {users.map((u) => (
          <li key={u.id}>
            {u.id}: {u.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;