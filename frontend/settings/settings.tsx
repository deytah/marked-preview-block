import {useBase, useGlobalConfig, useWatchable} from '@airtable/blocks/ui';
import {Base, Field, FieldType} from '@airtable/blocks/models';
import GlobalConfig from "@airtable/blocks/dist/types/src/global_config";
import {cursor} from "@airtable/blocks";

export const ConfigKeys = {
    IS_ENFORCED: 'isEnforced',
    TABLE_BLOCKED: 'tableBlockedTableId',
    MARKED_FIELD_ID: 'urlFieldId',
    CONTENT_TYPE_LOCKED: 'contentType',
    INCLUDE_MARKDOWN: 'includeMarkdown',
};

export const allowedUrlFieldTypes = [
    FieldType.MULTILINE_TEXT,
    FieldType.RICH_TEXT,
];

/**
 * Return settings from GlobalConfig with defaults, and converts them to Airtable objects.
 * @param {GlobalConfig} globalConfig
 * @param {Base} base - The base being used by the block in order to convert id's to objects
 * @param {string} activeTableId
 * @returns {SettingsInterface}
 */
function getSettings(globalConfig: GlobalConfig, base: Base, activeTableId: string): SettingsInterface {
    const isEnforced = Boolean(globalConfig.get(ConfigKeys.IS_ENFORCED));
    const markedFieldId = globalConfig.get([ConfigKeys.MARKED_FIELD_ID, activeTableId]) || '';
    const tableBlocked = !!globalConfig.get([ConfigKeys.TABLE_BLOCKED, activeTableId]);
    const markedField = !tableBlocked ? base.getTableById(activeTableId).getFieldByIdIfExists(markedFieldId.toString()) : null;
    const includeMarkdown = !!globalConfig.get([ConfigKeys.INCLUDE_MARKDOWN, activeTableId]);
    return {
        isEnforced,
        tableBlocked,
        markedField,
        includeMarkdown,
    };
}

/**
 * Wraps the settings with validation information
 * @param {SettingsInterface} settings - The object returned by getSettings
 * @returns {SettingsValidationInterface}
 */
function getSettingsValidationResult(settings: SettingsInterface): { settings: SettingsInterface, isValid: boolean, message: string | null } {
    const {isEnforced, tableBlocked, markedField} = settings;
    let isValid = true;
    let message = null;
    // If the enforcement switch is set to "Yes"...
    if (isEnforced && !tableBlocked) {
        if (!markedField) {
            // If a table has been selected, but no field...
            isValid = false;
            message = 'Please select a field for previews';
        } else if (!allowedUrlFieldTypes.includes(markedField.type)) {
            isValid = false;
            message = 'Please select a supported field for previews';
        }
    }

    return {
        isValid,
        message,
        settings,
    };
}

/**
 * A React hook to validate and access settings configured in SettingsForm.
 * @returns {SettingsValidationInterface}
 */
export function useSettings(): SettingsValidationInterface {
    const base = useBase();
    const globalConfig = useGlobalConfig();

    useWatchable(cursor, ['activeTableId']);
    const activeTableId = cursor.activeTableId;

    // If we're in that weird in between state, just return safe settings
    if (!activeTableId) {
        return {
            isValid: true,
            message: '',
            settings: {
                isEnforced: false,
                tableBlocked: false,
                markedField: null,
                includeMarkdown: false,
            }
        }
    }

    const settings = getSettings(globalConfig, base, activeTableId);

    return getSettingsValidationResult(settings);
}

export interface SettingsInterface {
    isEnforced: boolean,
    tableBlocked: boolean,
    markedField: Field,
    includeMarkdown: boolean,
}

export interface SettingsValidationInterface {
    settings: SettingsInterface,
    isValid: boolean,
    message: string | null
}
