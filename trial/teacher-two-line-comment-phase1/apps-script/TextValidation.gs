/**
 * 先生2行コメントの純粋な文字入力検証。
 *
 * Apps Script専用APIへ依存させず、ローカル試験からも同じ関数を読む。
 */

var TTLC_COMMENT_LINE_MAX_GRAPHEMES = 30;

function ttlcHasUnpairedSurrogate(value) {
  for (var index = 0; index < value.length; index += 1) {
    var codeUnit = value.charCodeAt(index);

    if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
      if (index + 1 >= value.length) {
        return true;
      }

      var nextCodeUnit = value.charCodeAt(index + 1);
      if (nextCodeUnit < 0xdc00 || nextCodeUnit > 0xdfff) {
        return true;
      }

      index += 1;
      continue;
    }

    if (codeUnit >= 0xdc00 && codeUnit <= 0xdfff) {
      return true;
    }
  }

  return false;
}

function ttlcFindForbiddenFormat(value) {
  if (/[\u000a\u000d\u0085\u2028\u2029]/.test(value)) {
    return "contains_newline";
  }

  if (/\u0009/.test(value)) {
    return "invalid_format";
  }

  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/.test(value)) {
    return "invalid_format";
  }

  return "";
}

function ttlcCreateGraphemeSegmenter() {
  if (
    typeof Intl !== "object" ||
    Intl === null ||
    typeof Intl.Segmenter !== "function"
  ) {
    return {
      ok: false,
      code: "segmentation_unavailable"
    };
  }

  try {
    return {
      ok: true,
      segmenter: new Intl.Segmenter("ja", { granularity: "grapheme" })
    };
  } catch (error) {
    return {
      ok: false,
      code: "segmentation_unavailable"
    };
  }
}

function ttlcCountGraphemes(value) {
  var segmenterResult = ttlcCreateGraphemeSegmenter();
  if (!segmenterResult.ok) {
    return segmenterResult;
  }

  var count = 0;
  var segments = segmenterResult.segmenter.segment(value);
  var iterator = segments[Symbol.iterator]();
  var step = iterator.next();

  while (!step.done) {
    count += 1;
    step = iterator.next();
  }

  return {
    ok: true,
    length: count
  };
}

function ttlcValidateCommentLine(value, options) {
  var settings = options || {};
  var required = settings.required === true;
  var maxLength =
    typeof settings.maxLength === "number"
      ? settings.maxLength
      : TTLC_COMMENT_LINE_MAX_GRAPHEMES;

  if (typeof value !== "string") {
    return {
      ok: false,
      code: "invalid_format"
    };
  }

  if (ttlcHasUnpairedSurrogate(value)) {
    return {
      ok: false,
      code: "invalid_format"
    };
  }

  var forbiddenCode = ttlcFindForbiddenFormat(value);
  if (forbiddenCode) {
    return {
      ok: false,
      code: forbiddenCode
    };
  }

  if (typeof value.normalize !== "function") {
    return {
      ok: false,
      code: "normalization_unavailable"
    };
  }

  var normalizedValue;
  try {
    normalizedValue = value.normalize("NFC").trim();
  } catch (error) {
    return {
      ok: false,
      code: "invalid_format"
    };
  }

  var countResult = ttlcCountGraphemes(normalizedValue);
  if (!countResult.ok) {
    return countResult;
  }

  if (required && countResult.length === 0) {
    return {
      ok: false,
      code: "required",
      value: normalizedValue,
      length: countResult.length
    };
  }

  if (countResult.length > maxLength) {
    return {
      ok: false,
      code: "too_long",
      value: normalizedValue,
      length: countResult.length,
      maxLength: maxLength
    };
  }

  return {
    ok: true,
    value: normalizedValue,
    length: countResult.length
  };
}

function ttlcValidateTwoLineComment(line1, line2, options) {
  var settings = options || {};
  var requiredBoth = settings.requiredBoth === true;

  var line1Result = ttlcValidateCommentLine(line1, {
    required: requiredBoth,
    maxLength: TTLC_COMMENT_LINE_MAX_GRAPHEMES
  });
  if (!line1Result.ok) {
    return {
      ok: false,
      field: "line1",
      code: line1Result.code,
      detail: line1Result
    };
  }

  var line2Result = ttlcValidateCommentLine(line2, {
    required: requiredBoth,
    maxLength: TTLC_COMMENT_LINE_MAX_GRAPHEMES
  });
  if (!line2Result.ok) {
    return {
      ok: false,
      field: "line2",
      code: line2Result.code,
      detail: line2Result
    };
  }

  return {
    ok: true,
    line1: line1Result,
    line2: line2Result
  };
}
