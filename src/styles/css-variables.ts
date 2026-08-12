/**
 * Atlas CSS Variable Engine
 *
 * Converts a theme object into CSS variables.
 */

type ThemeObject = Record<string, unknown>;

function flattenObject(
  object: ThemeObject,
  prefix = "",
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(object)) {
    const variable = prefix
      ? `${prefix}-${key}`
      : key;

    if (
      value !== null &&
      typeof value === "object"
    ) {
      Object.assign(
        result,
        flattenObject(
          value as ThemeObject,
          variable,
        ),
      );
    } else {
      result[variable] = String(value);
    }
  }

  return result;
}

/**
 * Converts a theme into CSS variables.
 */
export function themeToCSSVariables(
  theme: ThemeObject,
): Record<string, string> {
  const flat = flattenObject(theme);

  const variables: Record<string, string> = {};

  for (const [key, value] of Object.entries(flat)) {
    variables[`--atlas-${key}`] = value;
  }

  return variables;
}