import { describe, it, expect } from 'vitest';
import { buildImageSignature } from '../../src/utils/signature.js';

describe('buildImageSignature', () => {
  const classicScrunchieGroups = [
    { id: 'fabric', affectsImage: true },
    { id: 'colour', affectsImage: true },
    { id: 'size', affectsImage: false },
  ];

  it('builds expected signature for Classic Scrunchie with Floral Cotton, Blush Pink and Large', () => {
    const selectedOptions = [
      { groupId: 'fabric', optionId: 'opt-floral-cotton' },
      { groupId: 'colour', optionId: 'opt-blush-pink' },
      { groupId: 'size', optionId: 'opt-large' },
    ];

    const signature = buildImageSignature(classicScrunchieGroups, selectedOptions);
    expect(signature).toBe('colour:opt-blush-pink|fabric:opt-floral-cotton');
  });

  it('ignores size (affectsImage = false) completely', () => {
    const withRegular = [
      { groupId: 'fabric', optionId: 'opt-corduroy' },
      { groupId: 'colour', optionId: 'opt-dusty-blue' },
      { groupId: 'size', optionId: 'opt-regular' },
    ];

    const withLarge = [
      { groupId: 'fabric', optionId: 'opt-corduroy' },
      { groupId: 'colour', optionId: 'opt-dusty-blue' },
      { groupId: 'size', optionId: 'opt-large' },
    ];

    const withoutSize = [
      { groupId: 'fabric', optionId: 'opt-corduroy' },
      { groupId: 'colour', optionId: 'opt-dusty-blue' },
    ];

    const sigRegular = buildImageSignature(classicScrunchieGroups, withRegular);
    const sigLarge = buildImageSignature(classicScrunchieGroups, withLarge);
    const sigNone = buildImageSignature(classicScrunchieGroups, withoutSize);

    expect(sigRegular).toBe('colour:opt-dusty-blue|fabric:opt-corduroy');
    expect(sigLarge).toBe('colour:opt-dusty-blue|fabric:opt-corduroy');
    expect(sigNone).toBe('colour:opt-dusty-blue|fabric:opt-corduroy');
  });

  it('produces identical output regardless of the input order of selections', () => {
    const order1 = [
      { groupId: 'fabric', optionId: 'opt-floral-cotton' },
      { groupId: 'colour', optionId: 'opt-sage-green' },
    ];

    const order2 = [
      { groupId: 'colour', optionId: 'opt-sage-green' },
      { groupId: 'fabric', optionId: 'opt-floral-cotton' },
    ];

    expect(buildImageSignature(classicScrunchieGroups, order1)).toBe(
      buildImageSignature(classicScrunchieGroups, order2)
    );
    expect(buildImageSignature(classicScrunchieGroups, order1)).toBe(
      'colour:opt-sage-green|fabric:opt-floral-cotton'
    );
  });

  it('produces identical output regardless of the order of option groups definition', () => {
    const reversedGroups = [
      { id: 'size', affectsImage: false },
      { id: 'colour', affectsImage: true },
      { id: 'fabric', affectsImage: true },
    ];

    const selections = [
      { groupId: 'fabric', optionId: 'opt-floral-cotton' },
      { groupId: 'colour', optionId: 'opt-blush-pink' },
    ];

    expect(buildImageSignature(reversedGroups, selections)).toBe(
      'colour:opt-blush-pink|fabric:opt-floral-cotton'
    );
  });

  it('throws an informative error when an image-affecting option selection is missing', () => {
    const missingColour = [{ groupId: 'fabric', optionId: 'opt-floral-cotton' }];

    expect(() => buildImageSignature(classicScrunchieGroups, missingColour)).toThrow(
      /Missing selection for image-affecting option group: "colour"/
    );

    const missingFabric = [{ groupId: 'colour', optionId: 'opt-blush-pink' }];

    expect(() => buildImageSignature(classicScrunchieGroups, missingFabric)).toThrow(
      /Missing selection for image-affecting option group: "fabric"/
    );
  });

  it('supports dictionary/record input format', () => {
    const dict = {
      fabric: 'opt-leopard-print',
      colour: 'opt-sage-green',
      size: 'opt-regular',
    };

    expect(buildImageSignature(classicScrunchieGroups, dict)).toBe(
      'colour:opt-sage-green|fabric:opt-leopard-print'
    );
  });

  it('works for hair bows with only 2 option groups', () => {
    const hairBowGroups = [
      { id: 'fabric', affectsImage: true },
      { id: 'colour', affectsImage: true },
    ];

    const selections = [
      { groupId: 'fabric', optionId: 'opt-floral-cotton' },
      { groupId: 'colour', optionId: 'opt-blush-pink' },
    ];

    expect(buildImageSignature(hairBowGroups, selections)).toBe(
      'colour:opt-blush-pink|fabric:opt-floral-cotton'
    );
  });
});
