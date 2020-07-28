import {Field, Table} from "@airtable/blocks/models";
import {useRecordById} from "@airtable/blocks/ui";
import React from "react";
import SanitizedHTML from 'react-sanitized-html';
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';
import {ErrorBox} from "./MarkedPreview";
import {useSettings} from "./settings/settings";

const md = new MarkdownIt({
    html: true,
    linkify: true,
});

export default function RecordPreview(props: { table: Table, recordId: string, field: Field }) {
    const {table, recordId, field} = props;

    const record = useRecordById(table, recordId, {fields: [field]});
    if (!record) {
        return <ErrorBox message="Error: Record not found."/>
    }
    const html = (record.getCellValue(field) || '').toString();
    console.log(html);
    return <SanitizeHTML html={html}/>
}

function SanitizeHTML(props: { html: string }) {
    const {html} = props;

    const {settings: {includeMarkdown}} = useSettings();

    const html2 = includeMarkdown ? md.render(html.replace(/\n\[(.{1})]/g, "\\\n[$1]")) : html;

    const tmpEl = document.createElement('div');
    tmpEl.innerHTML = html2;

    const allowedTags = sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'u']);

    const links = tmpEl.querySelectorAll('a');
    links.forEach((aEl) => {
        if (!aEl.attributes.getNamedItem('target')) {
            aEl.setAttribute('target', '_blank');
        }
    });

    const htmlFixed = tmpEl.innerHTML;

    tmpEl.remove();

    return <SanitizedHTML allowedTags={allowedTags} html={htmlFixed}/>
}

