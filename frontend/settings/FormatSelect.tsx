import {Table} from "@airtable/blocks/models";
import {FormField, Select, Text, useSynced} from "@airtable/blocks/ui";
import React from "react";
import {ConfigKeys} from "./settings";

export default function FormatSelect(props: { activeTable: Table }) {
    const {activeTable} = props;
    const [contentTypeLocked, setContentTypeLocked, enabled] =
        useSynced([ConfigKeys.CONTENT_TYPE_LOCKED, activeTable.id]);
    const [includeMarkdown, setIncludeMarkdown,] =
        useSynced([ConfigKeys.INCLUDE_MARKDOWN, activeTable.id]);

    const value = !contentTypeLocked ? 1 : (!includeMarkdown ? 2 : 3);

    function onChange(value) {
        if (value === 1) {
            setContentTypeLocked(false);
        } else if (value === 2) {
            setContentTypeLocked(true);
            setIncludeMarkdown(false);
        } else if (value === 3) {
            setContentTypeLocked(true);
            setIncludeMarkdown(true);
        }
    }

    let explanation = '';
    if (value === 1) {
        explanation = 'The formatting for the preview is Switchable.';
    } else if (value === 2) {
        explanation = 'The preview format is locked to HTML Only.';
    } else if (value === 3) {
        explanation = 'The preview format is locked to Including Markdown.';
    }

    const options = [
        {value: 1, label: 'Switchable'},
        {value: 2, label: 'HTML Only'},
        {value: 3, label: 'Include Markdown'},
    ];

    return (
        <FormField label="Preview format">
            <Select disabled={!enabled} options={options} value={value} onChange={onChange}/>
            <Text paddingY={1} textColor="light">{explanation}</Text>
        </FormField>
    )
}
