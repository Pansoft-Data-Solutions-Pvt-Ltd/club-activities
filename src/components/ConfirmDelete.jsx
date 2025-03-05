// Copyright 2021-2023 Ellucian Company L.P. and its affiliates.

import React from 'react';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';

import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@ellucian/react-design-system/core';



export default function ConfirmDelete({ onDeleteCancel, onDeleteConfirm, contact }) {
    const intl = useIntl();

    return (
        <Dialog
            open={true}
            onClose={() => onDeleteCancel()}
            fullWidth
        >
           
            <DialogTitle
                style={{
                    backgroundColor: '#026BC8', // Keep title blue if required
                    color: 'white',
                    padding: '12px 16px',
                    fontWeight: 'bold',
                    borderTopLeftRadius: '4px',
                    borderTopRightRadius: '4px',
                    textAlign: 'center', // Centers title
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    position: 'relative' // Ensures no close button alignment issues
                }}
            >
            <span style={{ width: '100%', textAlign: 'center' }}>
            {intl.formatMessage({id: 'EmergencyContacts.confirmDeleteContact.title'})}
                </span>

        </DialogTitle>
            <DialogContent>
                <DialogContentText>
                {intl.formatMessage(
    { id: 'EmergencyContacts.confirmDeleteContact.instructions' },
    { name: contact?.stvactcDesc || "this club" }
)}

                </DialogContentText>
            </DialogContent>
            <DialogActions
    style={{
        display: 'flex',
        justifyContent: 'center',  // ✅ Centers buttons horizontally
        gap: '16px',               // ✅ Adds spacing between buttons
        paddingBottom: '16px'      // ✅ Adds padding for better spacing
    }}
>
    <Button onClick={() => onDeleteCancel()} color="secondary">
        {intl.formatMessage({id: 'EmergencyContacts.cancel'})}
    </Button>
    <Button
        onClick={() => onDeleteConfirm()}
        style={{
            backgroundColor: '#026BC8', // ✅ Set primary color
            color: 'white'             // ✅ Ensure white text for visibility
        }}
    >
        {intl.formatMessage({id: 'EmergencyContacts.delete'})}
    </Button>
</DialogActions>

        </Dialog>
    );
}

ConfirmDelete.propTypes = {
    onDeleteCancel: PropTypes.func.isRequired,
    onDeleteConfirm: PropTypes.func.isRequired,
    contact: PropTypes.object.isRequired,
};