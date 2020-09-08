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

    const activeTable = base.getTableByIdIfExists(cursor.activeTableId);

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
            <style>
            {`
                .contains-task-list {
                    list-style: none;
                    padding: 0;
                }
                .contains-task-list ul {
                    padding-left: 2em;
                }
                input[type="checkbox"] {
                    visibility: hidden;
                    width: 0;
                }
                input[type="checkbox"] + label:before {
                    border: 2px solid rgba(0,0,0,0.25);
                    border-radius: 3px;
                    box-sizing: border-box;
                    content: "\\00a0";
                    display: inline-block;
                    left: -25px;
                    margin: 0 .5em 0 0;
                    padding: 0;
                    vertical-align: bottom;
                    top: 3.5px;
                    width: 12px;
                    height: 12px;
                }
                input[type="checkbox"]:checked + label:before {
                    border: 0;
                    background-color: rgb(45, 127, 249);
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 16 16' style='shape-rendering: geometricprecision;'%3E%3Cpath fill-rule='evenodd' fill='white' d='M5.944 12.305a1.031 1.031 0 0 0 1.433-.009l5.272-5.181A1.483 1.483 0 0 0 12.661 5a1.468 1.468 0 0 0-2.109.025L7.008 8.701a.465.465 0 0 1-.685-.01l-.587-.641A1.42 1.42 0 0 0 3.661 8a1.473 1.473 0 0 0 .017 2.106l2.266 2.199z'%3E%3C/path%3E%3C/svg%3E");
                    box-sizing: border-box;
                    color: rgb(119, 119, 119);
                    content: "\\2713";
                    text-align: center;
                }
                input[type="checkbox"]:focus + label::before {
                    outline: rgb(59, 153, 252) auto 5px;
                }
            `}
            </style>
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
