/**
 * 試験環境の読み取り専用ガード。
 *
 * 設定値だけを検証する純粋関数と、Apps Script専用APIを使う処理を分ける。
 */

var TTLC_TRIAL_SPREADSHEET_NAME_PREFIX =
  "【試験専用・本番接続禁止】先生2行コメント 第1段階 シート ";

function ttlcIsNonEmptyTrimmedString(value) {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value === value.trim()
  );
}

function ttlcValidateEnvironmentConfig(config) {
  if (config === null || typeof config !== "object") {
    return {
      ok: false,
      code: "invalid_environment_config"
    };
  }

  if (!ttlcIsNonEmptyTrimmedString(config.environmentStatus)) {
    return {
      ok: false,
      code: "invalid_environment_config",
      field: "environmentStatus"
    };
  }

  if (config.environmentStatus !== "ACTIVE") {
    return {
      ok: false,
      code: "environment_inactive",
      environmentStatus: config.environmentStatus
    };
  }

  var requiredKeys = [
    "environmentId",
    "trialSpreadsheetId",
    "expectedSpreadsheetName",
    "scriptTimeZone"
  ];

  for (var index = 0; index < requiredKeys.length; index += 1) {
    var key = requiredKeys[index];
    if (!ttlcIsNonEmptyTrimmedString(config[key])) {
      return {
        ok: false,
        code: "invalid_environment_config",
        field: key
      };
    }
  }

  if (!ttlcIsValidEnvironmentId(config.environmentId)) {
    return {
      ok: false,
      code: "invalid_environment_id"
    };
  }

  if (!ttlcIsValidTrialSpreadsheetId(config.trialSpreadsheetId)) {
    return {
      ok: false,
      code: "invalid_spreadsheet_id"
    };
  }

  if (
    config.expectedSpreadsheetName.indexOf(
      TTLC_TRIAL_SPREADSHEET_NAME_PREFIX
    ) !== 0
  ) {
    return {
      ok: false,
      code: "invalid_spreadsheet_name"
    };
  }

  if (config.scriptTimeZone !== "Asia/Tokyo") {
    return {
      ok: false,
      code: "invalid_time_zone"
    };
  }

  return {
    ok: true,
    environmentId: config.environmentId,
    trialSpreadsheetId: config.trialSpreadsheetId,
    expectedSpreadsheetName: config.expectedSpreadsheetName
  };
}

function ttlcValidateSpreadsheetMetadataResponse(config, response) {
  var configResult = ttlcValidateEnvironmentConfig(config);
  if (!configResult.ok) {
    return configResult;
  }

  if (
    response === null ||
    typeof response !== "object" ||
    Array.isArray(response) ||
    response.properties === null ||
    typeof response.properties !== "object" ||
    Array.isArray(response.properties) ||
    !ttlcIsNonEmptyTrimmedString(response.properties.title)
  ) {
    return {
      ok: false,
      code: "invalid_spreadsheet_metadata"
    };
  }

  if (response.properties.title !== config.expectedSpreadsheetName) {
    return {
      ok: false,
      code: "spreadsheet_name_mismatch"
    };
  }

  return {
    ok: true,
    environmentId: config.environmentId,
    spreadsheetName: response.properties.title
  };
}

function ttlcReadEnvironmentConfig_() {
  var properties = PropertiesService.getScriptProperties().getProperties();

  return {
    environmentStatus: properties.ENVIRONMENT_STATUS,
    environmentId: properties.ENVIRONMENT_ID,
    trialSpreadsheetId: properties.TRIAL_SPREADSHEET_ID,
    expectedSpreadsheetName: properties.EXPECTED_SPREADSHEET_NAME,
    scriptTimeZone: Session.getScriptTimeZone()
  };
}

function ttlcGetTrialSpreadsheetMetadataReadOnly_() {
  var config = ttlcReadEnvironmentConfig_();
  var configResult = ttlcValidateEnvironmentConfig(config);

  if (!configResult.ok) {
    return {
      ok: false,
      code: configResult.code,
      field: configResult.field || ""
    };
  }

  var response;
  try {
    response = Sheets.Spreadsheets.get(
      config.trialSpreadsheetId,
      {
        fields: "properties.title"
      }
    );
  } catch (error) {
    return {
      ok: false,
      code: "spreadsheet_read_failed"
    };
  }

  var metadataResult = ttlcValidateSpreadsheetMetadataResponse(
    config,
    response
  );

  if (!metadataResult.ok) {
    return metadataResult;
  }

  return {
    ok: true,
    environmentId: metadataResult.environmentId,
    spreadsheetName: metadataResult.spreadsheetName
  };
}
