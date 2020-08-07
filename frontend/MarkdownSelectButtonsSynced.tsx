import {Table} from "@airtable/blocks/models";
import {SelectButtonsSynced, useGlobalConfig} from "@airtable/blocks/ui";
import React from "react";
import {ConfigKeys} from "./settings/settings";

export default function MarkdownSelectButtonsSynced(props: { activeTable: Table }) {
    const {activeTable} = props;
    const activeTableId = activeTable.id;

    const globalConfig = useGlobalConfig();
    const contentTypeLocked = !!globalConfig.get([ConfigKeys.CONTENT_TYPE_LOCKED, activeTableId]);

    if (contentTypeLocked) {
        return null;
    }

    const options = [
        { value: false, label: 'HTML'},
        { value: true, label: 'Markdown'}
    ]

    return (
        <SelectButtonsSynced
            globalConfigKey={[ConfigKeys.INCLUDE_MARKDOWN, activeTableId]}
            options={options}
            size="small"
            maxWidth="14em"
        />
    )
}
