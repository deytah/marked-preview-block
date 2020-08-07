import {useBase, useGlobalConfig} from '@airtable/blocks/ui';
import {Base, Field, FieldType, Table} from '@airtable/blocks/models';
import GlobalConfig from "@airtable/blocks/dist/types/src/global_config";

export const ConfigKeys = {
    IS_ENFORCED: 'isEnforced',
    INCLUDE_MARKDOWN: 'includeMarkdown',
    LOCKED_TABLE_ID: 'urlTableId',
    LOCKED_FIELD_ID: 'urlFieldId',
};

export const allowedUrlFieldTypes = [
    FieldType.FORMULA,
    FieldType.MULTIPLE_LOOKUP_VALUES,
    FieldType.MULTILINE_TEXT,
    FieldType.RICH_TEXT,
    FieldType.SINGLE_LINE_TEXT,
];

/**
 * Return settings from GlobalConfig with defaults, and converts them to Airtable objects.
 * @param {GlobalConfig} globalConfig
 * @param {Base} base - The base being used by the block in order to convert id's to objects
 * @returns {SettingsInterface}
 */
function getSettings(globalConfig: GlobalConfig, base: Base): SettingsInterface {
    if (typeof globalConfig.get(ConfigKeys.INCLUDE_MARKDOWN) !== "boolean") {
        globalConfig.setAsync(ConfigKeys.INCLUDE_MARKDOWN, true).then()
    }
    const isEnforced = Boolean(globalConfig.get(ConfigKeys.IS_ENFORCED));
    const lockedFieldId = globalConfig.get(ConfigKeys.LOCKED_FIELD_ID)?.toString();
    const lockedTableId = globalConfig.get(ConfigKeys.LOCKED_TABLE_ID)?.toString();
    const includeMarkdown = Boolean(globalConfig.get(ConfigKeys.INCLUDE_MARKDOWN))

    const lockedTable = base.getTableByIdIfExists(lockedTableId);
    const lockedField = lockedTable ? lockedTable.getFieldByIdIfExists(lockedFieldId) : null;
    return {
        isEnforced,
        includeMarkdown,
        lockedField,
        lockedTable,
    };
}

/**
 * Wraps the settings with validation information
 * @param {SettingsInterface} settings - The object returned by getSettings
 * @returns {SettingsValidationInterface}
 */
function getSettingsValidationResult(settings: SettingsInterface): { settings: SettingsInterface, isValid: boolean, message: string | null } {
    const {isEnforced, lockedTable, lockedField} = settings;
    let isValid = true;
    let message = null;
    // If the enforcement switch is set to "Yes"...
    if (isEnforced) {
        if (!lockedTable) {
            // If table has not yet been selected...
            isValid = false;
            message = 'Please select a table for previews';
        } else if (!lockedField) {
            // If a table has been selected, but no field...
            isValid = false;
            message = 'Please select a field for previews';
        } else if (!allowedUrlFieldTypes.includes(lockedField.type)) {
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
    console.log('globalConfig', globalConfig);
    const settings = getSettings(globalConfig, base);
    return getSettingsValidationResult(settings);
}

export interface SettingsInterface {
    isEnforced: boolean,
    includeMarkdown: boolean,
    lockedField: Field,
    lockedTable: Table,
}

export interface SettingsValidationInterface {
    settings: SettingsInterface,
    isValid: boolean,
    message: string | null
}
