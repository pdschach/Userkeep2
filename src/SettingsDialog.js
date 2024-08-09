// SettingsDialog.js
import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Button, InputLabel, Input } from '@mui/material';
import { doc, setDoc } from 'firebase/firestore';
import { db, storage } from './firebase'; // Zorg ervoor dat Firebase Storage en Firestore correct zijn geïmporteerd
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const SettingsDialog = ({ open, onClose }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSave = async () => {
    if (file) {
      setUploading(true);
      try {
        const storageRef = ref(storage, `templates/${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        const docRef = doc(db, 'templates', 'userBrief');
        await setDoc(docRef, { url: downloadURL });

        onClose();
      } catch (error) {
        console.error("Fout bij het uploaden van het bestand:", error);
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Instellingen - Upload Briefsjabloon</DialogTitle>
      <DialogContent>
        <InputLabel htmlFor="upload-file">Upload Word-document</InputLabel>
        <Input id="upload-file" type="file" onChange={handleFileChange} inputProps={{ accept: ".docx" }} />
        <Button 
          onClick={handleSave} 
          variant="contained" 
          color="primary" 
          sx={{ marginTop: 2 }} 
          disabled={uploading}
        >
          {uploading ? "Bezig met uploaden..." : "Opslaan"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
