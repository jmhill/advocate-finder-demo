"use client";

import { useEffect, useState } from "react";

export const getFilteredAdvocates = (advocates, searchTerm) => advocates.filter((advocate) => {
  // TODO: messy type coercion (e.g. yearsOfExperience)
  const search = searchTerm.toLowerCase();
  return (
    advocate.firstName.toLowerCase().includes(search) ||
    advocate.lastName.toLowerCase().includes(search) ||
    advocate.city.toLowerCase().includes(search) ||
    advocate.degree.toLowerCase().includes(search) ||
    advocate.specialties.some(element => element.toLowerCase().includes(search)) ||
    advocate.yearsOfExperience >= search
  );
});

export default function Home() {
  const [advocates, setAdvocates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    console.log("fetching advocates...");
    fetch("/api/advocates").then((response) => {
      response.json().then((jsonResponse) => {
        setAdvocates(jsonResponse.data);
      });
    });
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;
    setSearchTerm(searchTerm)
  };

  const onClick = () => {
    setSearchTerm('');
  };


  const filteredAdvocates = getFilteredAdvocates(advocates, searchTerm);

  const Cell = ({ children }: { children: JSX.Element }) => <td className="border border-gray-300 dark:border-gray-700 p-2 rounded">{children}</td>

  return (
    <main style={{ margin: "24px" }}>
      <h1 className="text-2xl">Solace Advocates</h1>
      <br />
      <br />
      <div>
        <h2 className="font-bold text-xl">Search</h2>
        <p>
          Searching for: <span id="search-term">{searchTerm}</span>
        </p>
        <input style={{ border: "1px solid black" }} value={searchTerm} onChange={onChange} className="py-2 px-4 mr-4 rounded" />
        <button onClick={onClick} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Reset Search</button>
      </div>
      <br />
      <br />
      <table className="border-separate border-spacing-2 border border-gray-400 dark:border-gray-500 rounded">
        <thead>
          <tr className="text-lg">
            <th>First Name</th>
            <th>Last Name</th>
            <th>City</th>
            <th>Degree</th>
            <th>Specialties</th>
            <th>Years of Experience</th>
            <th>Phone Number</th>
          </tr>
        </thead>
        <tbody>
          {filteredAdvocates.map((advocate) => {
            return (
              <tr key={advocate.id}>
                <Cell>{advocate.firstName}</Cell>
                <Cell>{advocate.lastName}</Cell>
                <Cell>{advocate.city}</Cell>
                <Cell>{advocate.degree}</Cell>
                <Cell>
                  {advocate.specialties.map((s) => (
                    <div key={s}>{s}</div>
                  ))}
                </Cell>
                <Cell>{advocate.yearsOfExperience}</Cell>
                <Cell>{advocate.phoneNumber}</Cell>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
