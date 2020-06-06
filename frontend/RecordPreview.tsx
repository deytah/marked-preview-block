import {Field, Table} from "@airtable/blocks/models";
import {Box, Text, useRecordById} from "@airtable/blocks/ui";
import React from "react";
import SanitizedHTML from 'react-sanitized-html';
import {allowedUrlFieldTypes, useSettings} from "./settings";

export default function RecordPreview(props: { activeTable: Table, selectedRecordId: string, selectedFieldId: string }) {
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
            <Box padding={2} borderBottom="thick">
                <Text>Field: {selectedField?.name}</Text>
            </Box>
            <Box padding={2} style={{overflowY: 'auto'}} flexGrow={1} display="flex">
                {!errorMessage ? <Preview table={activeTable} recordId={selectedRecordId} field={field}/> :
                    <ErrorBox message={errorMessage}/>}
            </Box>
        </Box>
    )
}

function Preview(props: { table: Table, recordId: string, field: Field }) {
    const {table, recordId, field} = props;
    const record = useRecordById(table, recordId, {fields: [field]});
    if (!record) {
        return <ErrorBox message="Error: Record not found."/>
    }
    const html = (record.getCellValue(field) || '').toString();
    return <SanitizeHTML html={html}/>
}

function SanitizeHTML(props: { html: string }) {
    const {html} = props;

    const tmpEl = document.createElement('div');
    tmpEl.innerHTML = html.toString();

    const links = tmpEl.querySelectorAll('a');
    links.forEach((aEl) => {
        if (!aEl.attributes.getNamedItem('target')) {
            aEl.setAttribute('target', '_blank');
        }
    });

    const htmlFixed = tmpEl.innerHTML;

    tmpEl.remove();

    return <SanitizedHTML html={htmlFixed}/>
}

function ErrorBox(props: { message: string }) {
    return (
        <Box display="flex" justifyContent="center" alignItems="center" flexGrow={1}>
            <Text>{props.message}</Text>
        </Box>
    )
}
