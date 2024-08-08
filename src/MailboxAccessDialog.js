// MailboxAccessDialog.js
import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import { getUserMailboxes } from './graph'; // Zorg ervoor dat het juiste pad wordt gebruikt

const MailboxAccessDialog = ({ open, onClose, user, accessToken }) => {
  const [mailboxes, setMailboxes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && user) {
      setLoading(true);
      getUserMailboxes(user.userPrincipalName, accessToken)
        .then(mailboxData => {
          setMailboxes(mailboxData);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching mailboxes:', error);
          setLoading(false);
        });
    }
  }, [open, user, accessToken]);

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
