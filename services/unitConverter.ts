export type UnitSystem = 'metric' | 'imperial';

export interface UnitPreferences {
  length: UnitSystem;
  weight: UnitSystem;
}

const CM_TO_INCH = 0.393701;
const INCH_TO_CM = 2.54;
const KG_TO_LBS = 2.20462;
const LBS_TO_KG = 0.453592;

export class UnitConverter {
  private static preferences: UnitPreferences = {
    length: 'metric',
    weight: 'metric',
  };

  static setPreferences(prefs: Partial<UnitPreferences>): void {
    this.preferences = { ...this.preferences, ...prefs };
  }

  static getPreferences(): UnitPreferences {
    return { ...this.preferences };
  }

  static cmToInches(cm: number): number {
    return Math.round(cm * CM_TO_INCH * 10) / 10;
  }

  static inchesToCm(inches: number): number {
    return Math.round(inches * INCH_TO_CM * 10) / 10;
  }

  static kgToLbs(kg: number): number {
    return Math.round(kg * KG_TO_LBS * 10) / 10;
  }

  static lbsToKg(lbs: number): number {
    return Math.round(lbs * LBS_TO_KG * 10) / 10;
  }

  static formatLength(cm: number, showUnit: boolean = true): string {
    if (this.preferences.length === 'imperial') {
      const inches = this.cmToInches(cm);
      const feet = Math.floor(inches / 12);
      const remainingInches = Math.round(inches % 12);
      return showUnit ? `${feet}'${remainingInches}"` : `${feet}'${remainingInches}"`;
    }
    return showUnit ? `${cm} cm` : `${cm}`;
  }

  static formatWeight(kg: number, showUnit: boolean = true): string {
    if (this.preferences.weight === 'imperial') {
      const lbs = this.kgToLbs(kg);
      return showUnit ? `${lbs} lbs` : `${lbs}`;
    }
    return showUnit ? `${kg} kg` : `${kg}`;
  }

  static formatMeasurement(value: number, type: 'length' | 'weight', showUnit: boolean = true): string {
    if (type === 'weight') {
      return this.formatWeight(value, showUnit);
    }
    return this.formatLength(value, showUnit);
  }

  static convertMeasurement(value: number, fromUnit: 'cm' | 'inches' | 'kg' | 'lbs'): number {
    switch (fromUnit) {
      case 'cm':
        return this.preferences.length === 'imperial' ? this.cmToInches(value) : value;
      case 'inches':
        return this.preferences.length === 'metric' ? this.inchesToCm(value) : value;
      case 'kg':
        return this.preferences.weight === 'imperial' ? this.kgToLbs(value) : value;
      case 'lbs':
        return this.preferences.weight === 'metric' ? this.lbsToKg(value) : value;
      default:
        return value;
    }
  }

  static getLengthUnit(): string {
    return this.preferences.length === 'imperial' ? 'in' : 'cm';
  }

  static getWeightUnit(): string {
    return this.preferences.weight === 'imperial' ? 'lbs' : 'kg';
  }

  static getHeightDisplay(heightCm: number): string {
    if (this.preferences.length === 'imperial') {
      const totalInches = this.cmToInches(heightCm);
      const feet = Math.floor(totalInches / 12);
      const inches = Math.round(totalInches % 12);
      return `${feet}'${inches}"`;
    }
    return `${heightCm} cm`;
  }
}

export default UnitConverter;
