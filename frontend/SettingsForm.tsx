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

function SettingsForm({setIsSettingsOpen}) {
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
            <Box flex="auto" padding={4} paddingBottom={2}>
                <Heading marginBottom={3}>Settings</Heading>
                <FormField label="">
                    <SwitchSynced
                        aria-label={`When enabled, the block will not show previews for the active table, ${activeTable.name}.`}
                        onChange={value => value &&
                            globalConfig.setAsync([ConfigKeys.MARKED_FIELD_ID, activeTableId], null).then()}
                        label="Block previews for this table"
                        globalConfigKey={[ConfigKeys.TABLE_BLOCKED, activeTableId]}
                    />
                    <Text paddingY={1} textColor="light">
                        {tableBlocked
                            ? 'The block will not show previews for this table.'
                            : 'The block will show previews of the selected cell in grid view.'}
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
                        </FormField>
                        <Text paddingY={1} textColor="light">
                            {markedField
                                ? 'The block will show previews for the specified field. Choose none to preview any valid selected cell.'
                                : 'The block will show previews of the selected cell in grid view.'}
                        </Text>
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

export default SettingsForm;
