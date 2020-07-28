import PropTypes from 'prop-types';
import React from 'react';
import {
    useGlobalConfig,
    Box,
    Button,
    FieldPickerSynced,
    FormField,
    Heading,
    SwitchSynced,
    Text,
    useWatchable,
    useBase,
} from '@airtable/blocks/ui';

import {useSettings, ConfigKeys, allowedUrlFieldTypes} from './settings';
import {cursor} from "@airtable/blocks";
import FormatSelect from "./FormatSelect";

export default function SettingsForm({setIsSettingsOpen}) {
    const base = useBase();
    const globalConfig = useGlobalConfig();
    useWatchable(cursor, ['activeTableId']);
    const activeTableId = cursor.activeTableId;
    const activeTable = base.getTableByIdIfExists(activeTableId);
    const {
        isValid,
        message,
        settings: {tableBlocked, markedField},
    } = useSettings();

    return (
        <Box
            position="absolute"
            top={0}
            bottom={0}
            left={0}
            right={0}
            display="flex"
            flexDirection="column"
        >
            <Box flex="auto" padding={3} paddingBottom={2} style={{overflowY: 'auto'}}>
                <Heading marginBottom={2}>Settings</Heading>
                <FormField label="">
                    <SwitchSynced
                        aria-label={`When disabled, the block will not show previews for the active table, ${activeTable.name}.`}
                        onChange={value => value &&
                            globalConfig.setAsync([ConfigKeys.MARKED_FIELD_ID, activeTableId], null).then()}
                        label={`Disable previews for: ${activeTable.name}`}
                        globalConfigKey={[ConfigKeys.TABLE_BLOCKED, activeTableId]}
                        variant="danger"
                    />
                    <Text paddingY={1} textColor="light">
                        {tableBlocked
                            ? `The block will not show previews for ${activeTable.name} table.`
                            : `The block will show previews for ${activeTable.name} table.`}
                    </Text>
                </FormField>
                {!tableBlocked && (
                    <div>
                        <FormField label="Preview field">
                            <FieldPickerSynced
                                table={activeTable}
                                globalConfigKey={[ConfigKeys.MARKED_FIELD_ID, activeTableId]}
                                allowedTypes={allowedUrlFieldTypes}
                                shouldAllowPickingNone={true}
                            />
                            <Text paddingY={1} textColor="light">
                                {markedField
                                    ? 'The block will show previews for the specified field. Choose none to preview any valid selected cell.'
                                    : 'The block will show previews of the selected cell in grid view.'}
                            </Text>
                        </FormField>
                        <FormatSelect activeTable={activeTable}/>
                    </div>
                )}
            </Box>
            <Box display="flex" flex="none" padding={3} borderTop="thick">
                <Box
                    flex="auto"
                    display="flex"
                    alignItems="center"
                    justifyContent="flex-end"
                    paddingRight={2}
                >
                    <Text textColor="light">{message}</Text>
                </Box>
                <Button
                    disabled={!isValid}
                    size="large"
                    variant="primary"
                    onClick={() => setIsSettingsOpen(false)}
                >
                    Done
                </Button>
            </Box>
        </Box>
    );
}

SettingsForm.propTypes = {
    setIsSettingsOpen: PropTypes.func.isRequired,
};
