export interface OptionGroupLike {
  id: string;
  affectsImage?: boolean;
}

export interface SelectedOptionLike {
  groupId: string;
  optionId: string;
}

/**
 * Builds the deterministic image signature for product variant images.
 *
 * Rules (per Section 6.5 of technical architecture):
 * - Takes only option groups where `affectsImage === true`.
 * - Sorts groups alphabetically by group id.
 * - Writes each pair as `${groupId}:${optionId}`.
 * - Joins pairs with `|`.
 *
 * @throws Error if an image-affecting group selection is missing.
 */
export function buildImageSignature(
  optionGroups: OptionGroupLike[],
  selectedOptions: SelectedOptionLike[] | Record<string, string>
): string {
  const selectionMap: Record<string, string> = {};

  if (Array.isArray(selectedOptions)) {
    for (const item of selectedOptions) {
      if (item && item.groupId && item.optionId) {
        selectionMap[item.groupId] = item.optionId;
      }
    }
  } else if (selectedOptions && typeof selectedOptions === 'object') {
    Object.assign(selectionMap, selectedOptions);
  }

  // Filter option groups that affect the image
  const affectingGroups = optionGroups.filter((g) => g.affectsImage === true);

  // Sort groups alphabetically by id
  affectingGroups.sort((a, b) => a.id.localeCompare(b.id));

  // Build parts and check for missing selections
  const parts: string[] = [];
  for (const group of affectingGroups) {
    const optionId = selectionMap[group.id];
    if (!optionId) {
      throw new Error(`Missing selection for image-affecting option group: "${group.id}"`);
    }
    parts.push(`${group.id}:${optionId}`);
  }

  return parts.join('|');
}
