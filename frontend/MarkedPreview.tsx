import {Table} from "@airtable/blocks/models";
import {Box, Text} from "@airtable/blocks/ui";
import React from "react";
import RecordPreview from "./RecordPreview";
import {allowedUrlFieldTypes, useSettings} from "./settings/settings";
import MarkdownSelectButtonsSynced from "./MarkdownSelectButtonsSynced";

interface IProps {
    activeTable: Table
    selectedRecordId: string
    selectedFieldId: string
}

export default function MarkedPreview({activeTable, selectedRecordId, selectedFieldId}: IProps) {
    const {
        settings: {isEnforced, lockedField, lockedTable},
    } = useSettings();

    let errorMessage = null;

    if (isEnforced) {
        if (activeTable.id !== lockedTable.id) {
            // Record is from a mismatching table.
            errorMessage = `This block is set up to preview URLs using records from the "${lockedTable.name}" table, but was opened from a different table.`;
        } else if (!selectedRecordId) {
            errorMessage = 'Select a cell to see a preview'
        }
    }

    const selectedField = errorMessage ? null : (isEnforced ? lockedField : selectedFieldId && activeTable.getField(selectedFieldId));

    if (!errorMessage && (!selectedField || !allowedUrlFieldTypes.includes(selectedField.type))) {
        // Preview is not supported in this case, as we wouldn't know what field to preview.
        // Show a dialog to the user instead.
        errorMessage = 'Please select a compatible field';
    }

    return (
        <Box display="flex" flexDirection="column" style={{height: '100vh', maxHeight: '100vh'}}>
            {!errorMessage &&
            <Box display="flex" justifyContent="space-between" padding={2} borderBottom="thick" alignItems="center">
              <Text style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
              }}>Field: <strong>{selectedField?.name}</strong></Text>
              <MarkdownSelectButtonsSynced/>
            </Box>}
            {!errorMessage && <Box padding={2} style={{overflowY: 'auto'}} flexGrow={1} display="flex">
              <RecordPreview table={activeTable} recordId={selectedRecordId} field={selectedField}/>
            </Box>}
            {errorMessage && <ErrorBox message={errorMessage}/>}
        </Box>
    )
}

export function ErrorBox(props: { message: string }) {
    return (
        <Box display="flex" justifyContent="center" alignItems="center" flexGrow={1} padding={2}>
            <Text>{props.message}</Text>
        </Box>
    )
}
