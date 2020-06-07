import {Table} from "@airtable/blocks/models";
import {SwitchSynced, useGlobalConfig} from "@airtable/blocks/ui";
import React from "react";
import {ConfigKeys} from "./settings";

export default function MarkdownSwitchSynced(props: { activeTable: Table }) {
    const {activeTable} = props;
    const activeTableId = activeTable.id;

    const globalConfig = useGlobalConfig();
    const contentTypeLocked = !!globalConfig.get([ConfigKeys.CONTENT_TYPE_LOCKED, activeTableId]);

    if (contentTypeLocked) {
        return null;
    }

    return (
        <SwitchSynced
            aria-label={`When enabled, the block will render markdown for the active table, ${activeTable.name}.`}
            backgroundColor="transparent"
            globalConfigKey={[ConfigKeys.INCLUDE_MARKDOWN, activeTableId]}
            label="Use markdown"
            onChange={value => value &&
                globalConfig.setAsync([ConfigKeys.MARKED_FIELD_ID, activeTableId], null).then()}
            style={{height: "16px"}}
            width="auto"
        />
    )
}
