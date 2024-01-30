package com.thealgorithms.maths;
import java.util.LinkedHashSet;
import java.util.Set;
import org.apache.commons.lang3.tuple.Pair;

public class AmicableNumber {

    /**
     * This function finds all amicable number pairs within a given range of integers
     * from 'from' to 'to', and returns a set of such pairs.
     * 
     * @param from The `from` parameter specifies the starting point of the range of
     * values to be searched for amicable pairs.
     * 
     * @param to The `to` input parameter specifies the upper bound of the range of
     * integers for which amicable pairs are to be found.
     * 
     * @returns The output of the function `findAllInRange` is a `Set` of `Pair`s of
     * integers within the range specified by `from` and `to`. More specifically:
     * 
     * 1/ If the input parameters `from` and `to` are invalid (i.e., one or both are
     * negative), an `IllegalArgumentException` is thrown.
     * 2/ The function initializes an empty `LinkedHashSet` called `result`.
     * 3/ It then iterates over the range of values from `from` to `to`, inclusive. For
     * each value `i` between `from` and `to`, the function checks if the pair (`i`,
     * `i+1`) is amicable (i.e., whether `i*j` is a perfect square). If it is amicable.
     * the pair is added to `result`.
     * 4/ The function returns `result`, which now contains all amicable pairs of integers
     * within the given range.
     */
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

    /**
     * This function checks whether two input integers "a" and "b" are amicable numbers
     * - pairs of integers where one number is equal to the sum of all divisors (except
     * itself and 1) of the other.
     * 
     * @param a In the function `isAmicableNumber(int a)`, the variable `a` is one of the
     * two input parameters. It represents the first number being tested for amicability.
     * 
     * @param b In the provided `isAmicableNumber()` function， `b` is the second integer
     * parameter that represents the divisors of `a`. The function checks if `a` and `b`
     * are amicable numbers by verifying that `sumOfDividers(a)` is equal to `b`, and
     * vice versa.
     * 
     * @returns The output returned by this function is a `boolean` value indicating
     * whether the two input integers `a` and `b` are amicable numbers or not. An amicable
     * number is a number that can be expressed as the sum of two smaller integers where
     * the sum is a product of two prime numbers.
     * 
     * More specifically:
     * 
     * 	- If `sumOfDividers(a)` and `sumOfDividers(b)` are both equal to `a` (i.e., if
     * `a` is the only divisor of both `a` and `b`), then `a` and `b` are amicable numbers
     * and the function returns `true`.
     * 	- Otherwise (i.e., if there are other divisors or no divisors), the function
     * returns `false`.
     */
    public static boolean isAmicableNumber(int a, int b) {
        if (a <= 0 || b <= 0) {
            throw new IllegalArgumentException("Input numbers must be natural!");
        }
        return sumOfDividers(a, a) == b && sumOfDividers(b, b) == a;
    }

    /**
     * This function calculates the sum of all positive integers less than or equal to
     * `number` that are diviable by `divisor`.
     * 
     * @param number The `number` input parameter represents the integer for which we are
     * finding the sum of all its dividers.
     * 
     * @param divisor The `divisor` input parameter represents the number to be divided
     * by the input `number`, and it is used to determine whether `number` is divisible
     * by `divisor`. If `divisor` is 1 and the input `number` does not have a remainder
     * when divided by `divisor`, then the function returns `0`, indicating that there
     * are no factors of `number`. If `divisor` is greater than 1 and `number` is divisible
     * by `divisor`, then the function recursively calls itself with the remaining number
     * (`number`) and the next potential dividor (`divisor`).
     * 
     * @returns The function `sumOfDividers` takes two integers `number` and `divisor`,
     * and returns the sum of all positive integers less than or equal to `number` that
     * are divisible by `divisor`.
     * 
     * The output returned by this function is an integer value that represents the sum
     * of all positive integers less than or equal to `number` that are divisible by `divisor`.
     * 
     * To describe the output concisely: the function iteratively computes the sum of all
     * positive integers less than or equal to `number` that are divisible by `divisor`,
     * starting from `1` and moving towards `number`.
     */
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
