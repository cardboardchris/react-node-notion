import { useState } from "react";

// Copy the payload shape interface from our server
// We want to copy (rather than import) since we we won't necessarily deploy our
// front end and back end to the same place
interface CrewMember {
  name: string;
  ability: string;
  instructions: any[];
}

function App() {
  // A state value will store the current state of the array of data which can be updated
  // by editing your database in Notion and then pressing the fetch button again
  const [CrewMember, setCrewMember] = useState<CrewMember[]>([]);

  return (
    <div>
      <h1>Crew Members</h1>
      <button
        type="button"
        onClick={() => {
          fetch("http://localhost:8000/")
            .then((response) => response.json())
            .then((payload) => {
              // Set the React state with the array response
              setCrewMember(payload);
              window.console.log('🚀 ~ .then ~ payload:', payload)
            });
        }}
      >
        Fetch List
      </button>

      {/* Map the resulting object array into an ordered HTML list with anchor links */}
      {/* Using index as key is harmless since we will only ever be replacing the full list */}
      <ol>
        {CrewMember.map((thing, idx) => {
          return (
            <li key={idx}>
              <ul>
                <li>{thing.name}</li>
                <li>{thing.ability}</li>
                <li>{thing.instructions}</li>
              </ul>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default App;