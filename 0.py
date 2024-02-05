import math
from typing import List, Tuple


def default_matrix_multiplication(a: List, b: List) -> List:
    """
    Provides a default matrix multiplication implementation given two lists
    representing the matrices' dimensions.

    Args:
        a (List): The `a` input parameter provides two lists as matrix elements
            for multiplication.
        b (List): The `b` input parameter provides a list of another matrix that
            is used as the second operand for multiplication with the first matrix
            given as `a`.

    Returns:
        List: Returns: [ [[a[0][0] * b[0][0] + a[0][1] * b[1][0], a[0][0] * b[0][1]
        + a[0][1] * b[1][1]],
                        [a[1][0] * b[0][0] + a[1][1] * b[1][0], a[1][0] * b[0][1]
        + a[1][1] * b[1][1]] ]

    """
    if len(a) != 2 or len(a[0]) != 2 or len(b) != 2 or len(b[0]) != 2:
        raise Exception("Matrices are not 2x2")
    new_matrix = [
        [a[0][0] * b[0][0] + a[0][1] * b[1][0], a[0][0] * b[0][1] + a[0][1] * b[1][1]],
        [a[1][0] * b[0][0] + a[1][1] * b[1][0], a[1][0] * b[0][1] + a[1][1] * b[1][1]],
    ]
    return new_matrix
 

def matrix_addition(matrix_a: List, matrix_b: List):
    """
    The function matrix_addition takes two lists of lists ( matrices) and returns
    a new list of lists. It appends each element of the first matrix to each element
    of the second matrix by row.

    Args:
        matrix_a (List): Here is the concise answer you requested:
            
            matrix_a is a List that serves as the first operand for matrix addition.
        matrix_b (List): THE SECOND MATRIX IS ADDED TO THE FIRST MATRIX ROW BY ROW
            USING THE COLUMN-WISE ADDITION IN THIS DEFINED FUNCTION.

    Returns:
        list: The function returns a list of lists representing the result of
        adding two matrices. Each sublist within the larger list contains the sum
        of the corresponding elements of the input matrices.

    """
    return [
        [matrix_a[row][col] + matrix_b[row][col] for col in range(len(matrix_a[row]))]
        for row in range(len(matrix_a))
    ]
 
 
def matrix_subtraction(matrix_a: List, matrix_b: List):
    """
    The given function takes two lists as input and returns a list of lists
    representing the element-wise subtraction of the matrices. It does so by
    iterating over each row of both inputs and computing the differences of
    corresponding elements.

    Args:
        matrix_a (List): PROVIDES THE FIRST MATRIX AS AN INPUT PARAMETER.
        matrix_b (List): Of course. Here is your response:
            
            The `matrix_b` input parameter is subtracted from each element of `matrix_a`.

    Returns:
        list: The output returned by this function is a list of lists. Each sub-list
        contains the differences between corresponding elements of matrices A and
        B.

    """
    return [
        [matrix_a[row][col] - matrix_b[row][col] for col in range(len(matrix_a[row]))]
        for row in range(len(matrix_a))
    ]
 
 
def split_matrix(a: List,) -> Tuple[List, List, List, List]:
    """
    The provided function `split_matrix` takes an input list `a` and splits it
    into four separate lists: `top_left`, `top_right`, `bot_left`, and `bot_right`.
    These lists are constructed by splitting the original list into two halves and
    then each half into two sub-halves. The function raises an exception if the
    input matrix is odd or has any non-square element.

    Args:
        a (List): The input `a` is a list and it gets split into 4 lists as output.

    Returns:
        Tuple[List, List, List, List]: The function split_matrix takes a list as
        an argument and returns a tuple of four lists.

    """
    if len(a) % 2 != 0 or len(a[0]) % 2 != 0:
        raise Exception("Odd matrices are not supported!")
 
    matrix_length = len(a)
    mid = matrix_length // 2
 
    top_right = [[a[i][j] for j in range(mid, matrix_length)] for i in range(mid)]
    bot_right = [
        [a[i][j] for j in range(mid, matrix_length)] for i in range(mid, matrix_length)
    ]
 
    top_left = [[a[i][j] for j in range(mid)] for i in range(mid)]
    bot_left = [[a[i][j] for j in range(mid)] for i in range(mid, matrix_length)]
 
    return top_left, top_right, bot_left, bot_right
 
 
def matrix_dimensions(matrix: List) -> Tuple[int, int]:
    """
    The function matrix_dimensions takes a list as input and returns a tuple
    containing the length of the list and the length of each element of the list.

    Args:
        matrix (List): Accepts a list as its sole input.

    Returns:
        Tuple[int, int]: The function returns a tuple containing two integers: the
        row count and column count of the input matrix.

    """
    return len(matrix), len(matrix[0])
 
 
def print_matrix(matrix: List) -> None:
    """
    Prints each element of the matrix provided as a list of values.

    Args:
        matrix (List): The `matrix` input parameter takes a list as an argument
            and loops through each element of that list using the range() function.

    """
    for i in range(len(matrix)):
        print(matrix[i])
 
 
def actual_strassen(matrix_a: List, matrix_b: List) -> List:
    """
    The given function takes two matrices as input and applies the Strassen matrix
    multiplication algorithm to multiply them. It returns a new matrix that
    represents the result of the multiplication.

    Args:
        matrix_a (List): Of course. Here is the answer to your question:
            
            The `matrix_a` input parameter represents the first matrix used for multiplication.
        matrix_b (List): No problem; here is the answer to your question.
            
            The `matrix_b` input parameter represents a matrix that will be used
            along with `matrix_a` as the other operand for matrix multiplication
            and additions.

    Returns:
        List: The output returned by this function is a list of lists representing
        the matrix.

    """
    if matrix_dimensions(matrix_a) == (2, 2):
        return default_matrix_multiplication(matrix_a, matrix_b)
 
    a, b, c, d = split_matrix(matrix_a)
    e, f, g, h = split_matrix(matrix_b)
 
    t1 = actual_strassen(a, matrix_subtraction(f, h))
    t2 = actual_strassen(matrix_addition(a, b), h)
    t3 = actual_strassen(matrix_addition(c, d), e)
    t4 = actual_strassen(d, matrix_subtraction(g, e))
    t5 = actual_strassen(matrix_addition(a, d), matrix_addition(e, h))
    t6 = actual_strassen(matrix_subtraction(b, d), matrix_addition(g, h))
    t7 = actual_strassen(matrix_subtraction(a, c), matrix_addition(e, f))
 
    top_left = matrix_addition(matrix_subtraction(matrix_addition(t5, t4), t2), t6)
    top_right = matrix_addition(t1, t2)
    bot_left = matrix_addition(t3, t4)
    bot_right = matrix_subtraction(matrix_subtraction(matrix_addition(t1, t5), t3), t7)
 
    # construct the new matrix from our 4 quadrants
    new_matrix = []
    for i in range(len(top_right)):
        new_matrix.append(top_left[i] + top_right[i])
    for i in range(len(bot_right)):
        new_matrix.append(bot_left[i] + bot_right[i])
    return new_matrix
 
 
def strassen(matrix1: List, matrix2: List) -> List:
    """
    The given function 'strassen' takes two lists 'matrix1' and 'matrix2' representing
    matrices of unknown dimension and checks the dimensions for validity before
    multiplying them using the actual strassen algorithm.  It returns a single
    list representing the matrix product after removing extra zero elements added
    during computation

    Args:
        matrix1 (List): Of course. Here is your response with a length under 100
            words without any repeated text:
            
            The input matrix1 to the function serves as one of the two operands
            to be multiplied using Strassen's algorithm. It is used alongside
            matrix2 as an iterative part of the multiplication process and contains
            values to be productized along with the other input.
        matrix2 (List): The second input parameter matrix2 ( List -> List ) is
            used as a second operand to multiply by Strassen's algorithm.

    Returns:
        List: The output returned by this function is a list of matrices.

    """
    if matrix_dimensions(matrix1)[1] != matrix_dimensions(matrix2)[0]:
        raise Exception(
            f"Unable to multiply these matrices, please check the dimensions. \n"
            f"Matrix A:{matrix1} \nMatrix B:{matrix2}"
        )
    dimension1 = matrix_dimensions(matrix1)
    dimension2 = matrix_dimensions(matrix2)
 
    if dimension1[0] == dimension1[1] and dimension2[0] == dimension2[1]:
        return matrix1, matrix2
 
    maximum = max(max(dimension1), max(dimension2))
    maxim = int(math.pow(2, math.ceil(math.log2(maximum))))
    new_matrix1 = matrix1
    new_matrix2 = matrix2
 
    # Adding zeros to the matrices so that the arrays dimensions are the same and also
    # power of 2
    for i in range(0, maxim):
        if i < dimension1[0]:
            for j in range(dimension1[1], maxim):
                new_matrix1[i].append(0)
        else:
            new_matrix1.append([0] * maxim)
        if i < dimension2[0]:
            for j in range(dimension2[1], maxim):
                new_matrix2[i].append(0)
        else:
            new_matrix2.append([0] * maxim)
 
    final_matrix = actual_strassen(new_matrix1, new_matrix2)
 
    # Removing the additional zeros
    for i in range(0, maxim):
        if i < dimension1[0]:
            for j in range(dimension2[1], maxim):
                final_matrix[i].pop()
        else:
            final_matrix.pop()
    return final_matrix 
