// BriefDialog.js
import React from 'react';
import { Dialog, DialogTitle, DialogContent, Button } from '@mui/material';
import { Print as PrintIcon } from '@mui/icons-material';

const BriefDialog = ({ open, onClose, content }) => {
  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`<pre>${content}</pre>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Gegenereerde Brief</DialogTitle>
      <DialogContent>
        <pre>{content}</pre>
        <Button onClick={handlePrint} variant="contained" color="primary" startIcon={<PrintIcon />}>
          Print
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default BriefDialog;
