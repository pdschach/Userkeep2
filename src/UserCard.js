// UserCard.js
import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, IconButton, Collapse, List, ListItem, ListItemText, Checkbox, Button } from '@mui/material';
import { ExpandMore, ExpandLess, Check, Delete, ContentCopy, Group as GroupIcon, Mail as MailIcon, Print as PrintIcon } from '@mui/icons-material';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase'; // Zorg ervoor dat Firestore correct is geïmporteerd
import { storage } from './firebase'; // Zorg ervoor dat Firebase Storage is geïmporteerd
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';

const UserCard = ({ user, handleCheckboxChange, handleCompleteUser, handleShowGroups, handleShowMailboxes, handleDeleteUser }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setTimeout(() => {}, 2000); // Reset after 2 seconds
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  const renderTodoSummary = (user) => {
    const completedTasks = Object.entries(user.todo || {})
      .filter(([key, value]) => value)
      .map(([key]) => key);

    const pendingTasks = Object.entries(user.todo || {})
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    return {
      completed: completedTasks,
      pending: pendingTasks,
    };
  };

  const handleGenerateBrief = async () => {
    try {
      const docRef = doc(db, 'templates', 'userBrief');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { url } = docSnap.data();
        
        // Log de URL om zeker te zijn dat we de juiste URL krijgen
        console.log('Document URL:', url);
        
        // Fetch the file from Firebase Storage
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch document from Storage');
        }
        
        const arrayBuffer = await response.arrayBuffer();
        console.log('Document fetched successfully.');

        const zip = new PizZip(arrayBuffer);
        const doc = new Docxtemplater(zip, {
          paragraphLoop: true,
          linebreaks: true,
        });

        doc.setData({
          username: user.displayName,
          email: user.userPrincipalName,
          // Voeg hier andere variabelen toe die je in je sjabloon hebt
        });

        // Probeer het document te renderen en vang eventuele fouten op
        try {
          doc.render();
          console.log('Document rendered successfully.');
        } catch (renderError) {
          console.error('Error rendering document:', renderError);
          alert('Er is een fout opgetreden bij het verwerken van het document.');
          return;
        }

        const out = doc.getZip().generate({
          type: "blob",
          mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });

        // Log om te bevestigen dat het document klaar is voor download
        console.log('Document ready for download.');

        // Save the generated document
        saveAs(out, `Brief_${user.displayName}.docx`);
        console.log('Download prompt should have appeared.');
      } else {
        console.error("Geen sjabloon gevonden in Firestore");
      }
    } catch (error) {
      console.error('Fout bij het genereren van de brief:', error);
      alert('Er is een fout opgetreden bij het genereren van de brief.');
    }
  };

  const summary = renderTodoSummary(user);
  const primaryColor = '#008075';
  const accentColor = '#EBAFB9';
  const highlightColor = '#A0ADE0';
  const secondaryColor = '#FAA573';

  return (
    <Card sx={{ marginBottom: 2, border: `1px solid ${highlightColor}` }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center">
            <IconButton onClick={toggleExpand} sx={{ color: primaryColor }}>
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
            <Typography variant="h6" sx={{ color: primaryColor }}>{user.displayName}</Typography>
            {summary.pending.length > 0 && (
              <Typography variant="body2" sx={{ marginLeft: 1, color: accentColor }}>
                Te Doen: {summary.pending.length}
              </Typography>
            )}
            {summary.completed.length > 0 && (
              <Typography variant="body2" sx={{ marginLeft: 1, color: primaryColor }}>
                Voltooid: {summary.completed.length}
              </Typography>
            )}
          </Box>
          <Box>
            <Button
              variant="contained"
              onClick={() => handleCompleteUser(user)}
              startIcon={<Check />}
              sx={{
                marginRight: 1,
                backgroundColor: primaryColor,
                '&:hover': {
                  backgroundColor: highlightColor,
                },
                color: '#fff',
              }}
            >
              Naar Voltooid
            </Button>
            <Button
              variant="contained"
              onClick={() => handleDeleteUser(user.id)}
              startIcon={<Delete />}
              sx={{
                backgroundColor: accentColor,
                '&:hover': {
                  backgroundColor: secondaryColor,
                },
                color: '#fff',
              }}
            >
              Verwijder
            </Button>
          </Box>
        </Box>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ borderTop: 1, borderColor: 'divider', paddingTop: 2 }}>
            <List>
              {['givenName', 'surname', 'userPrincipalName', 'jobTitle', 'department'].map((field, index) => (
                <ListItem key={index}>
                  <ListItemText primary={field.replace(/([A-Z])/g, ' $1')} secondary={user[field]} />
                  <IconButton onClick={() => copyToClipboard(user[field])}>
                    <ContentCopy />
                  </IconButton>
                </ListItem>
              ))}
              <ListItem>
                <ListItemText primary="Created At" secondary={new Date(user.createdDateTime).toLocaleString()} />
              </ListItem>
            </List>
            <Box sx={{ paddingTop: 2 }}>
              {['Postvakdelegatie', 'Groepen (Active Directory)', 'Logonscript', 'Ultimo (profiel)', 'Ultimo (user koppeling)', 'Controle profiel', 'Intranet machtigingen', 'Brief'].map(item => (
                <Box display="flex" alignItems="center" key={item}>
                  <Checkbox
                    checked={user.todo && user.todo[item]}
                    onChange={(e) => handleCheckboxChange(user.id, item, e.target.checked)}
                  />
                  <Typography variant="body2">{item}</Typography>
                  {item === 'Groepen (Active Directory)' && (
                    <IconButton onClick={(e) => { e.stopPropagation(); handleShowGroups(user); }}>
                      <GroupIcon />
                    </IconButton>
                  )}
                  {item === 'Postvakdelegatie' && (
                    <IconButton onClick={(e) => { e.stopPropagation(); handleShowMailboxes(user); }}>
                      <MailIcon />
                    </IconButton>
                  )}
                  {item === 'Brief' && (
                    <IconButton onClick={(e) => { e.stopPropagation(); handleGenerateBrief(user); }}>
                      <PrintIcon />
                    </IconButton>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default UserCard;
