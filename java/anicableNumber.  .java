package com.thealgorithms.maths;
import java.util.LinkedHashSet;
import java.util.Set;
import org.apache.commons.lang3.tuple.Pair;

public class AmicableNumber {

    public static Set<Pair<Integer, Integer>> findAllInRange(int from, int to) {
        if (from <= 0 || to <= 0 || to < from) {
            throw new IllegalArgumentException("Given range of values is invalid!");
        }

        Set<Pair<Integer, Integer>> result = new LinkedHashSet<>();

        for (int i = from; i < to; i++) {
            for (int j = i + 1; j <= to; j++) {
                if (isAmicableNumber(i, j)) {
                    result.add(Pair.of(i, j));
                }
            }
        }
        return result;
    }

    public static boolean isAmicableNumber(int a, int b) {
        if (a <= 0 || b <= 0) {
            throw new IllegalArgumentException("Input numbers must be natural!");
        }
        return sumOfDividers(a, a) == b && sumOfDividers(b, b) == a;
    }

    private static int sumOfDividers(int number, int divisor) {
        if (divisor == 1) {
            return 0;
        } else if (number % --divisor == 0) {
            return sumOfDividers(number, divisor) + divisor;
        } else {
            return sumOfDividers(number, divisor);
        }
    }
}
