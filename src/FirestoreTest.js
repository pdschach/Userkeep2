import React, { useState } from 'react';
import { db } from './firebase';
import { collection, addDoc, getDoc, doc } from 'firebase/firestore';

function FirestoreTest() {
  const [testData, setTestData] = useState(null);
  const [error, setError] = useState(null);

  const testFirestore = async () => {
    try {
      // Voeg een document toe aan de 'test' collectie
      const docRef = await addDoc(collection(db, 'test'), {
        name: "Test User",
        createdAt: new Date()
      });

      console.log("Document written with ID: ", docRef.id);

      // Haal het document op
      const docSnap = await getDoc(doc(db, 'test', docRef.id));
      if (docSnap.exists()) {
        setTestData(docSnap.data());
      } else {
        console.log("No such document!");
      }
    } catch (err) {
      console.error("Error adding document: ", err);
      setError(err);
    }
  };

  return (
    <div>
      <h1>Firestore Test</h1>
      <button onClick={testFirestore}>Test Firestore Connection</button>
      {error && <div style={{ color: 'red' }}>Error: {error.message}</div>}
      {testData && (
        <div>
          <h2>Document Data:</h2>
          <p>Name: {testData.name}</p>
          <p>Created At: {new Date(testData.createdAt.seconds * 1000).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}

export default FirestoreTest;
