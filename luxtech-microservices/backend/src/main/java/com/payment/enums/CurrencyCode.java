package com.payment.enums;

/**
 * ISO 4217 Currency Codes used in DE49 (Transaction Currency Code).
 */
public enum CurrencyCode {

    MAD("504", "Moroccan Dirham", 2),
    USD("840", "US Dollar", 2),
    EUR("978", "Euro", 2),
    GBP("826", "British Pound", 2),
    SAR("682", "Saudi Riyal", 2),
    AED("784", "UAE Dirham", 2),
    JPY("392", "Japanese Yen", 0);

    private final String numericCode;
    private final String name;
    private final int decimalPlaces;

    CurrencyCode(String numericCode, String name, int decimalPlaces) {
        this.numericCode = numericCode;
        this.name = name;
        this.decimalPlaces = decimalPlaces;
    }

    public String getNumericCode() {
        return numericCode;
    }

    public String getName() {
        return name;
    }

    /** Number of decimal places (used to convert major → minor units). */
    public int getDecimalPlaces() {
        return decimalPlaces;
    }

    /** Convert a major-unit amount (e.g. 99.99) to minor units (e.g. 9999). */
    public long toMinorUnits(double amount) {
        return Math.round(amount * Math.pow(10, decimalPlaces));
    }

    public static CurrencyCode fromNumericCode(String code) {
        for (CurrencyCode cc : values()) {
            if (cc.numericCode.equals(code)) {
                return cc;
            }
        }
        throw new IllegalArgumentException("Unknown currency code: " + code);
    }
}
