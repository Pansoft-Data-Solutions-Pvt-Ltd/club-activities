import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useIntl } from 'react-intl';

import {
    Button,
    CircularProgress,
    makeStyles,
    Snackbar,
    Typography,
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogContentText, 
    DialogActions,
    IconButton,
} from '@ellucian/react-design-system/core';

import { colorFillAlertError, spacing20, spacing40, spacing80 } from '@ellucian/react-design-system/core/styles/tokens';

import { withIntl } from '../i18n/ReactIntlProviderWrapper';

import { useCardInfo, useData, useExtensionControl } from '@ellucian/experience-extension-utils';

import { DataQueryProvider, userTokenDataConnectQuery, useDataQuery } from '@ellucian/experience-extension-extras';

import { useDashboard } from '../hooks/dashboard';

import EditClub from '../components/EditClub.jsx';

import ConfirmDelete from '../components/ConfirmDelete.jsx';

import { addStudentClub } from '../data/student-club';



const useStyles = makeStyles(() => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderRadius: '4px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
 
        // Remove height: '400px' and overflow: 'hidden'
    },
    headerImage: {
        width: '100%',
        height: '100px',
        borderTopLeftRadius: '4px',
        borderTopRightRadius: '4px',
        marginBottom: '5px',
        objectFit: 'cover',
        display: 'block',
    },
    contentContainer: {
        padding: spacing40,
        fontFamily: "Roboto Condensed, Impact, Franklin Gothic Bold, sans-serif"
    },
    clubListContainer: {
        marginBottom: spacing40,
    },
    clubCard: {
        marginBottom: '2px',
        backgroundColor: 'transparent',
        borderBottom: '1px solid #e0e0e0',
        boxShadow: 'none',
        borderRadius: '0',
        fontFamily: 'Roboto, sans-serif',
        '&:hover': {
            backgroundColor: '#f8f9fa',
        }
    },
    contentMessage: {
        height: '100%',
        marginRight: spacing40,
        marginBottom: 0,
        marginLeft: spacing40,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
    },
    addContactButtonBox: {
        display: 'flex',
        justifyContent: 'center',
        gap: spacing40,
        marginTop: spacing40,
        marginBottom: spacing40,
    },
    contactsBox: {
        cursor: 'pointer'
    },
    contactsTableRow: {
        height: 'auto'
    },
    addButton: {
        marginRight: spacing20
    },
    actionButtonsBox: {
        marginRight: spacing20
    },
    spinnerBox: {
        height: '100%',
        flex: '1 0 70%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    busyBox: {
        height: '100%',
        width: '100%',
        flex: '1 0 70%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: '0',
        zIndex: 10
    },
    message: {
        marginLeft: spacing80,
        marginRight: spacing80,
        fontSize: '14px',
        color: '#6B7280',
        textAlign: 'center',
        fontFamily: 'Roboto, sans-serif',

    },
    exploreButtonBox: {
        display: 'flex',
        justifyContent: 'center',
        gap: spacing40,
        marginTop: spacing40,
        marginBottom: spacing20,
    },
    titleText: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: '8px',
        fontFamily: 'Roboto, sans-serif',
        textAlign: 'center',
        marginTop: spacing20
    },
    eventName: {
        fontSize: '14px',
        color: '#1F2937',
        fontWeight: 'normal',
        fontFamily: 'Roboto, sans-serif'
      },
      listHeader: {
        fontSize: '16px',
        //fontWeight: 'bold',
        color: '#026BC8',
        marginBottom: '8px',
        fontFamily: "Roboto Condensed, Impact, Franklin Gothic Bold, sans-serif"
      },
}), { index: 2});

function StudentClubs() {
    const intl = useIntl();
    const classes = useStyles();
   
    // Experience SDK hooks

    const [selectedClub, setSelectedClub] = useState(null);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const { setErrorMessage } = useExtensionControl();
    const { authenticatedEthosFetch } = useData();
    const { serverConfigContext: { cardPrefix }, cardId, configuration: { clubLimit,clubFees } = {} } = useCardInfo();
   
    useDashboard();

    const { data: payload, dataError, inPreviewMode, isError, isLoading, isRefreshing, refresh } = useDataQuery(process.env.PIPELINE_GET_STUDENT_CLUBS);
    const [studentClubs, setStudentClubs] = useState([]);

    
    const [ editClubContext, setEditClubContext ] = useState({ show: false });
    const [ showSnackbar, setShowSnackbar ] = useState(false);
    const [ snackMessage, setSnackMessage ] = useState();
    const [ busy, setBusy ] = useState(false);
    const [ busyUntilRefresh, setBusyUntilRefresh ] = useState(false);

    useEffect(() => {
        if (isError) {
            setErrorMessage({
                headerMessage: intl.formatMessage({id: 'StudentClubs.contactAdministrator'}),
                textMessage: intl.formatMessage({id: 'StudentClubs.dataError'}),
                iconName: 'warning',
                iconColor: colorFillAlertError
            });
        }
    }, [intl, isError, setErrorMessage]);

    useEffect(() => {
        if (busy && !busyUntilRefresh && !isRefreshing) {
            setBusy(false);
        }
    }, [busy, busyUntilRefresh, isRefreshing]);

    useEffect(() => {
        if (payload?.studentClubs) {
            setStudentClubs(payload.studentClubs);
        }
    }, [payload]);
    

    const addContact = useCallback(async ({name,term,bannerId,clubFees}) => {
        setBusyUntilRefresh(true);
        setBusy(true);
        const postResult = await addStudentClub({ authenticatedEthosFetch, cardId, cardPrefix, contact: { name,term ,bannerId,clubFees} });
        if (postResult.status === 'success') {
            showSnackbarMessage(`Club Activity ${name} was added`);
        }
        if (postResult.status !== 'success') {
            showSnackbarMessage(`Club Activity ${name} not added due to Error ${postResult}`);
        }
        refresh();
        setBusyUntilRefresh(false);
    }, [ authenticatedEthosFetch, cardId, cardPrefix, refresh, showSnackbarMessage, setBusy, setBusyUntilRefresh ]);

    const handleUnregister = async (club) => {
        console.log("Unregistering from club:", club.stvactcDesc);
    
        // ✅ Remove club from the local state to reflect changes immediately
        setStudentClubs(prevClubs => prevClubs.filter(c => c.stvactcDesc !== club.stvactcDesc));
    
        // ✅ Close the Confirm Delete dialog & Club Details modal
        setConfirmDeleteOpen(false);
        setSelectedClub(null);
    };
    

    const onAddContact = useCallback(() => {
        setEditClubContext({ addContact, mode: 'add', show: true ,payload,clubLimit,clubFees});
    }, [addContact, setEditClubContext,payload,clubLimit,clubFees]);
 
    const onCloseEditClub = useCallback(() => {
        setEditClubContext({ show: false });
    }, [setEditClubContext]);

    
    const showSnackbarMessage = useCallback(message => {
        setShowSnackbar(true);
        setSnackMessage(message);
    }, [setShowSnackbar, setSnackMessage]);

    const showSpinning = !payload && isLoading;
    const showNotConfigured = !payload && inPreviewMode && dataError?.statusCode === 404;
    const showNoClubs =  payload &&  payload?.studentClubs?.length===0;

    if (showNotConfigured) {
        return (
            <div className={classes.root}>
                <div className={classes.contentMessage}>
                    <Typography className={classes.message} variant="body1" component="div">
                        {intl.formatMessage({ id: 'StudentClubs.notConfigured'})}
                    </Typography>
                </div>
            </div>
        );
    } else if (showSpinning) {
        return (
            <div className={classes.spinnerBox}>
                <div>
                    <CircularProgress/>
                </div>
            </div>
        );
    } else if (showNoClubs) {
        return (
            <div className={classes.root}>
                <div className={classes.contentMessage}>
                    <Typography className={classes.message} variant="body1" component="div">
                        {intl.formatMessage({ id: 'StudentClubs.noClubs'})}
                    </Typography>
                    <div className={classes.addContactButtonBox}>
                        <Button className={classes.addContactButton} color='secondary' onClick={onAddContact}>
                            {intl.formatMessage({id: 'StudentClubs.addClub'})}
                        </Button>
                    </div> 
                </div>
                {editClubContext.show && (
                    <EditClub context={editClubContext} onClose={onCloseEditClub}/>
                )}
            </div>
        );
    } else if (payload && payload?.studentClubs?.length > 0) {     
        return (
            <div className={classes.root}>
                <img 
                    src="https://miro.medium.com/v2/resize:fit:1400/1*Cd8vnd7bQ18EnsxSWDj9uw.jpeg" 
                    alt="Header" 
                    className={classes.headerImage} 
                />
        
                <div className={classes.contentContainer}>
                    <Typography variant="h6" className={classes.listHeader} align='center'>
                        Registered Clubs in {payload?.Terms?.find(term => term.code === payload?.currentTerm)?.desc || payload?.currentTerm}
                    </Typography>
        
                    <div className={classes.clubListContainer}>
                        {studentClubs?.map((club, index) => (
                            <div key={index} className={classes.clubCard} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography className={classes.eventName}>
                                {club ? club.stvactcDesc : 'Unknown'}
                            </Typography>
                        
                            <IconButton
                                onClick={() => setSelectedClub(club)}
                                className={classes.iconButton}
                                size="small"
                                style={{ 
                                    padding: '6px',
                                    borderRadius: '50%',
                                    backgroundColor: 'white',
                                    border: '1px solid #ffffff', 
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <svg 
                                    width="20" height="20" viewBox="0 0 24 24"
                                    fill="none" xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M4 12h16M14 6l6 6-6 6" 
                                          stroke="#026BC8" 
                                          strokeWidth="2.5" 
                                          strokeLinecap="round" 
                                          strokeLinejoin="round"/>
                                </svg>
                            </IconButton>
                        </div>
                        
                        ))}
                    </div>
        
                    <div className={classes.exploreButtonBox}>
                        <Button variant="contained" color="primary" onClick={() => onAddContact()}>
                            {intl.formatMessage({ id: 'StudentClubs.exploreClubs', defaultMessage: 'Explore Clubs' })}
                        </Button>
                    </div>
                </div>
        
                {/* ✅ Show Edit Club Modal if Needed */}
                {editClubContext.show && (
                    <EditClub context={editClubContext} onClose={onCloseEditClub}/>
                )}
        
                {/* ✅ ADD THE MODAL HERE */}
                {selectedClub && (
                    <Dialog open={true} onClose={() => setSelectedClub(null)} fullWidth>
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
        {selectedClub.stvactcDesc} Details
    </span>

    <IconButton
        onClick={() => setSelectedClub(null)}
        style={{
            position: 'absolute',
            right: '8px',
            top: '8px',
            color: 'white'
        }}
        aria-label="Close"
    >
        ✖
    </IconButton>
    
</DialogTitle>

                        <DialogContent>
                            <DialogContentText>
                                <b>Club Name:</b> {selectedClub.stvactcDesc} <br />

                                <b>Status:</b> {selectedClub.description || "Registered"} <br />
                                
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions style={{
    display: 'flex',
    justifyContent: 'center',
    paddingBottom: '16px'
}}>
    
        <Button 
            onClick={() => setConfirmDeleteOpen(true)} 
            style={{ backgroundColor: '#026BC8', color: 'white' }}
        >
            Unregister
        </Button>
    
    <Button 
        onClick={() => setSelectedClub(null)} 
        style={{ backgroundColor: '#026BC8', color: 'white' }} // Updated Button Style
    >
        Close
    </Button>
</DialogActions>
{confirmDeleteOpen && (
    <ConfirmDelete 
        onDeleteCancel={() => setConfirmDeleteOpen(false)}
        onDeleteConfirm={() => handleUnregister(selectedClub)}
        contact={selectedClub}
    />
)}
                    </Dialog>
                )}
        
                {/* ✅ Snackbar for Showing Messages */}
                <Snackbar
                    open={showSnackbar}
                    message={<Typography className={classes.message}>{snackMessage}</Typography>}
                    onClose={() => setShowSnackbar(false)}
                />
        
                {busy && (
                    <div
                        className={classes.busyBox}
                        onClick={(event) => { event.stopPropagation(); }}
                        onKeyUp={(event) => { event.stopPropagation(); }}
                        role='button'
                        tabIndex={0}
                    >
                        <CircularProgress/>
                    </div>
                )}
            </div>
        );
        
    }
}

function StudentClubsWithProviders() {
    
    const options = useMemo(() => ({
        queryFunction: userTokenDataConnectQuery,
        resource: process.env.PIPELINE_GET_STUDENT_CLUBS
    }
    ), []);

    return (
        <DataQueryProvider options={options}>
            <StudentClubs/>
        </DataQueryProvider>
    );
}

export default withIntl(StudentClubsWithProviders);
