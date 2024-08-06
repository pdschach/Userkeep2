// MailboxAccessDialog.js
import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import { getUserMailboxes } from './graph'; // Importeer de functie om postvakken op te halen

const MailboxAccessDialog = ({ open, onClose, user }) => {
  const [mailboxes, setMailboxes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && user) {
      setLoading(true);
      getUserMailboxes(user.id)
        .then(mailboxData => {
          setMailboxes(mailboxData);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching mailboxes:', error);
          setLoading(false);
        });
    }
  }, [open, user]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Postvakken voor {user?.displayName}</DialogTitle>
      <DialogContent>
        {loading ? (
          <CircularProgress />
        ) : (
          <List>
            {mailboxes.map(mailbox => (
              <ListItem key={mailbox.id}>
                <ListItemText primary={mailbox.displayName} />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MailboxAccessDialog;
