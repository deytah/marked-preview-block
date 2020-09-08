import {Field, Table} from "@airtable/blocks/models";
import {useRecordById} from "@airtable/blocks/ui";
import React from "react";
import ReactDOMServer from "react-dom/server";
import SanitizedHTML from 'react-sanitized-html';
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';
import markdownItTaskLists from "../lib/markdown-it-task-lists/index";
import {ErrorBox} from "./MarkedPreview";
import {useSettings} from "./settings/settings";

const md = new MarkdownIt({
    html: true,
    linkify: true,
}).use(markdownItTaskLists);

const defaultTextRender = md.renderer.rules.text;

md.renderer.rules.text = function (tokens, idx, options, env, self) {
    const token = tokens[idx];
    const matches = token.content.match(/\[(X|\s|\_|\-)\]\s(.*)/i);

    if (matches) {
        token.content = matches[2];
        return ReactDOMServer.renderToString(<span>
            <input type="checkbox" checked={matches[1].trim()} disabled/>
            <label>{defaultTextRender(tokens, idx, options, env, self)}</label>
        </span>);
    }
    // pass token to default renderer.
    return defaultTextRender(tokens, idx, options, env, self);
};

export default function RecordPreview(props: { table: Table, recordId: string, field: Field }) {
    const {table, recordId, field} = props;

    const record = useRecordById(table, recordId, {fields: [field]});
    if (!record) {
        return <ErrorBox message="Error: Record not found."/>
    }

    const html = (record.getCellValue(field) || '').toString();
    return <SanitizeHTML html={html}/>
}

function SanitizeHTML({html}: { html: string }) {
    const {settings: {includeMarkdown}} = useSettings();

    if (includeMarkdown) {
        html = html
            .replace(/^(\s*)\[(X|\s|\_|\-)\]\s(.*)/gim, "$1- [$2] $3")
            .replace(/\n\[(.{1})]/g, "\\\n[$1]");
    }
    const html2 = includeMarkdown ? md.render(html) : html;

    const domParser = new DOMParser();
    const tmpEl = domParser.parseFromString(html2, 'text/html');

    const allowedTags = sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'u', 'label', 'input']);
    const allowedAttributes = sanitizeHtml.defaults.allowedAttributes;
    allowedAttributes['input'] = ['checked', 'type', 'disabled'];
    allowedAttributes['ul'] = ['class'];
    allowedAttributes['li'] = ['class'];

    const links = tmpEl.querySelectorAll('a');
    links.forEach((aEl) => {
        if (!aEl.attributes.getNamedItem('target')) {
            aEl.setAttribute('target', '_blank');
        }
    });

    const htmlFixed = tmpEl.body.innerHTML;

    return <SanitizedHTML allowedTags={allowedTags} allowedAttributes={allowedAttributes} html={htmlFixed}/>
}

