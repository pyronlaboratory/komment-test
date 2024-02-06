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
     * This function sets the coefficients of a linear convolution kernel using two double
     * arrays `aCoeffs` and `bCoeffs`. It throws an exception if either array is the wrong
     * length or if the first element of `aCoeffs` is zero. Otherwise it sets the elements
     * of the internal coefficient arrays `coeffsA` and `coeffsB` to the corresponding
     * elements of `aCoeffs` and `bCoeffs`.
     * 
     * @param aCoeffs The `aCoeffs` input parameter is an array of doubles that contains
     * the coefficients of the polyotic equation's leading polynomial. It is used to set
     * the values of the `coeffsA` array.
     * 
     * @param bCoeffs The `bCoeffs` input parameter is used to set the second set of
     * coefficients (b) for the polynomials. It has the same length as the `aCoeffs` array
     * and must also have order equal to the specified `order`.
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
     * This function implements a moving average price predictor for financial time series
     * data. It takes a single input sample and outputs the predicted price. The algorithm
     * uses a user-defined set of coefficients `coeffsA` and `coeffsB` to weigh the
     * historical price movements and apply a moving average with a specified order (degree
     * of smoothing).
     * 
     * @param sample The `sample` input parameter is the current input value that is used
     * to calculate the output of the recursive digital filter. It is used as the current
     * value of the history X and Y arrays and it is passed through the algorithm to get
     * the resulting output.
     * 
     * @returns This function takes a double `sample` as input and returns a double value
     * as output. The output is the processed input value after applying the recursive
     * moving average algorithm with coefficients `coeffsA` and `coeffsB`. The function
     * first computes the moving average of the previous `order` values of the input
     * series using the given coefficients and then applies feedback to incorporate the
     * latest input value into the moving average. The final output is a smoothed estimate
     * of the input series with reduced noise.
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
