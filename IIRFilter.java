package com.thealgorithms.audiofilters;

public class IIRFilter {

    private final int order;
    private final double[] coeffsA;
    private final double[] coeffsB;
    private final double[] historyX;
    private final double[] historyY;

    public IIRFilter(int order) throws IllegalArgumentException {
        if (order < 1) {
            throw new IllegalArgumentException("order must be greater than zero");
        }

        this.order = order;
        coeffsA = new double[order + 1];
        coeffsB = new double[order + 1];

        // Sane defaults
        coeffsA[0] = 1.0;
        coeffsB[0] = 1.0;

        historyX = new double[order];
        historyY = new double[order];
    }

    /**
     * This function sets the coefficients of a and b polynomials using two arrays `aCoeffs`
     * and `bCoeffs`. It checks that the length of the input arrays match the expected
     * order and raises an exception if there are any issues. Then it sets the coefficients
     * of the two polynomials.
     * 
     * @param aCoeffs The `aCoeffs` input parameter sets the coefficients of the linear
     * predictor for the a-components.
     * 
     * @param bCoeffs The `bCoeffs` input parameter sets the second set of coefficients
     * (for the polynomial of degree `order`) for the filter.
     */
    public void setCoeffs(double[] aCoeffs, double[] bCoeffs) throws IllegalArgumentException {
        if (aCoeffs.length != order) {
            throw new IllegalArgumentException("aCoeffs must be of size " + order + ", got " + aCoeffs.length);
        }

        if (aCoeffs[0] == 0.0) {
            throw new IllegalArgumentException("aCoeffs.get(0) must not be zero");
        }

        if (bCoeffs.length != order) {
            throw new IllegalArgumentException("bCoeffs must be of size " + order + ", got " + bCoeffs.length);
        }

        for (int i = 0; i <= order; i++) {
            coeffsA[i] = aCoeffs[i];
            coeffsB[i] = bCoeffs[i];
        }
    }

    /**
     * This function performs a simple linear regression on a single input `sample` using
     * the values stored within the arrays `historyX` and `historyY`. It calculates the
     * output `result` using a recursively applied equation based on previous values.
     * 
     * @param sample The `sample` input parameter is the current input value that the
     * function processes and uses to generate an output value. It is used as the input
     * for the first element of the historical data arrays (`historyX` and `historyY`)
     * and is also used as the initial value for those arrays.
     * 
     * @returns This function takes a single double value `sample` as input and returns
     * a double value as output. The output is calculated by applying a set of coefficients
     * to the previous values of two arrays `historyX` and `historyY`, feeding back the
     * results to the array elements themselves and finally dividing the sum of the outputs
     * by a constant value. In simpler terms: it performs a weighted sum of past values
     * and provides the result as an output.
     */
    public double process(double sample) {
        double result = 0.0;

        // Process
        for (int i = 1; i <= order; i++) {
            result += (coeffsB[i] * historyX[i - 1] - coeffsA[i] * historyY[i - 1]);
        }
        result = (result + coeffsB[0] * sample) / coeffsA[0];

        // Feedback
        for (int i = order - 1; i > 0; i--) {
            historyX[i] = historyX[i - 1];
            historyY[i] = historyY[i - 1];
        }

        historyX[0] = sample;
        historyY[0] = result;

        return result;
    }
}
