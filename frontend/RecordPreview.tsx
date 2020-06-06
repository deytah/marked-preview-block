import {Field, Table} from "@airtable/blocks/models";
import {useRecordById} from "@airtable/blocks/ui";
import React from "react";
import SanitizedHTML from 'react-sanitized-html';
import {ErrorBox} from "./MarkedPreview";

export default function RecordPreview(props: { table: Table, recordId: string, field: Field }) {
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

