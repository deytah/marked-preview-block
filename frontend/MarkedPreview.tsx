import {Table} from "@airtable/blocks/models";
import {Box, Text} from "@airtable/blocks/ui";
import React from "react";
import RecordPreview from "./RecordPreview";
import {allowedUrlFieldTypes, useSettings} from "./settings/settings";
import MarkdownSwitchSynced from "./MarkdownSwitchSynced";

export default function MarkedPreview(props: { activeTable: Table, selectedRecordId: string, selectedFieldId: string }) {
    const {activeTable, selectedRecordId, selectedFieldId} = props;

    const {
        settings: {tableBlocked, markedField},
    } = useSettings();

    const selectedField = (!tableBlocked && !markedField) ? activeTable.getFieldByIdIfExists(selectedFieldId) : null;
    const field = markedField ?
        markedField :
        (
            (selectedField && allowedUrlFieldTypes.includes(selectedField.type)) ? selectedField : null
        );

    let errorMessage = null;

    if (tableBlocked) {
        errorMessage = 'Previews are blocked for this table.';
    } else if (!selectedRecordId) {
        errorMessage = 'Please select a record.';
    } else if (selectedField && !field) {
        errorMessage = 'Please pick a valid field.';
    }

    return (
        <Box display="flex" flexDirection="column" style={{height: '100vh', maxHeight: '100vh'}}>
            {!errorMessage && <Box display="flex" justifyContent="space-between" padding={2} borderBottom="thick">
                <Text>Field: {selectedField?.name}</Text>
                <MarkdownSwitchSynced activeTable={activeTable}/>
            </Box>}
            {!errorMessage && <Box padding={2} style={{overflowY: 'auto'}} flexGrow={1} display="flex">
                <RecordPreview table={activeTable} recordId={selectedRecordId} field={field}/>
            </Box>}
            {errorMessage && <ErrorBox message={errorMessage}/>}
        </Box>
    )
}

export function ErrorBox(props: { message: string }) {
    return (
        <Box display="flex" justifyContent="center" alignItems="center" flexGrow={1}>
            <Text>{props.message}</Text>
        </Box>
    )
}
