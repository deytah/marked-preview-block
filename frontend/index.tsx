import {cursor} from "@airtable/blocks";
import {Box, initializeBlock, useBase, useLoadable, useSettingsButton, useWatchable} from '@airtable/blocks/ui';
import React, {useEffect, useState} from 'react';
import MarkedPreview from "./MarkedPreview";
import {useSettings} from './settings/settings';
import SettingsForm from './settings/SettingsForm';

function MarkedPreviewBlock() {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    useSettingsButton(() => setIsSettingsOpen(!isSettingsOpen));

    const [selectedRecordId, setSelectedRecordId] = useState('');
    const [selectedFieldId, setSelectedFieldId] = useState('');

    const {isValid} = useSettings();

    useLoadable(cursor);
    useWatchable(cursor, ['activeTableId', 'activeViewId', 'selectedRecordIds', 'selectedFieldIds'], () => {
        if (cursor.selectedRecordIds.length > 0) {
            setSelectedRecordId(cursor.selectedRecordIds[0]);
        }
        if (cursor.selectedFieldIds.length > 0) {
            setSelectedFieldId(cursor.selectedFieldIds[0]);
        }
    });

    useWatchable(cursor, ['activeTableId', 'activeViewId'], () => {
        setSelectedRecordId(null);
        setSelectedFieldId(null);
    });

    const base = useBase();

    const activeTable = base.getTableById(cursor.activeTableId);

    if (!isValid && !isSettingsOpen) {
        setIsSettingsOpen(true)
    }
    useEffect(() => {
        // Display the settings form if the settings aren't valid.
        if (!isValid && !isSettingsOpen) {
            setIsSettingsOpen(true);
        }
    }, [isValid, isSettingsOpen]);

    // activeTable is briefly null when switching to a newly created table.
    if (!activeTable) {
        return null;
    }

    return (
        <Box>
            {isSettingsOpen ? (
                <SettingsForm setIsSettingsOpen={setIsSettingsOpen}/>
            ) : (
                <MarkedPreview activeTable={activeTable}
                               selectedRecordId={selectedRecordId}
                               selectedFieldId={selectedFieldId}/>
            )}
        </Box>
    );
}

initializeBlock(() => <MarkedPreviewBlock/>);
