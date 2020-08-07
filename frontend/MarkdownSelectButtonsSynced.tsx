import {SelectButtonsSynced} from "@airtable/blocks/ui";
import React from "react";
import {ConfigKeys} from "./settings/settings";

export default function MarkdownSelectButtonsSynced() {
    const options = [
        { value: false, label: 'HTML'},
        { value: true, label: 'Markdown'}
    ]

    return (
        <SelectButtonsSynced
            globalConfigKey={ConfigKeys.INCLUDE_MARKDOWN}
            options={options}
            size="small"
            maxWidth="14em"
        />
    )
}
