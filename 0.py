import math
from typing import List, Tuple


def default_matrix_multiplication(a: List, b: List) -> List:
    """
    Calculates the matrix multiplication of two 2x2 matrices using given lists for
    each element. Raises an Exception if input matrices are not 2x2. Returns a
    List with the matrix elements.

    Args:
        a (List): Verb: Accepts
            
            Parameter `a`: Provides the first list of a matrix for multiplication.
        b (List): Processes elements of the input List b

    Returns:
        List: Output: A list containing two lists of integers.

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
    ADDS MATRICES.
    The function matrix_addition takes two lists representing matrices as input
    and returns a list of lists representing the added matrices. It loops through
    each row of both matrices and adds corresponding elements.

    Args:
        matrix_a (List): Provides the first matrix to add.
        matrix_b (List): No problem; here's your answer:
            
            Adds a second matrix to be added element-wise to the first.

    Returns:
        list: The function returns a list of lists. Each sub-list within the outer
        list represents a row of the result matrix and consists of summed elements
        from corresponding rows of input matrices A and B.

    """
    return [
        [matrix_a[row][col] + matrix_b[row][col] for col in range(len(matrix_a[row]))]
        for row in range(len(matrix_a))
    ]
 
 
def matrix_subtraction(matrix_a: List, matrix_b: List):
    """
    The function matrix_subtraction takes two lists as input and returns a list
    of lists representing the difference of each row of matrix A and matrix B.

    Args:
        matrix_a (List): OK. Here is your answer:
            
            The matrix_a parameter is a list of lists where each sub-list represents
            a row and each integer within each sub-list represents a column.
        matrix_b (List): The `matrix_b` parameter is subtracted element-wise from
            the corresponding elements of `matrix_a`.

    Returns:
        list: The output of this function is a list of lists. Each inner list
        consists of every element at each respective position within every row of
        the original two input matrices minus the corresponding element from the
        opposing matrix's respective position.

    """
    return [
        [matrix_a[row][col] - matrix_b[row][col] for col in range(len(matrix_a[row]))]
        for row in range(len(matrix_a))
    ]
 
 
def split_matrix(a: List,) -> Tuple[List, List, List, List]:
    """
    The function splits a given list of matrices into four separate lists: top-left
    (symmetric), top-right ( symmertic), bottom-left (asymmetric), and bottom-right
    (asymmetric) matrices.

    Args:
        a (List): Here is your documentation answer:
            
            INPUT PARAMETER `a`: a list to be split into multiple lists of varying
            lengths

    Returns:
        Tuple[List, List, List, List]: The function returns a tuple of four lists:
        (top_left(), top_right(), bot_left(), and bot_right()).

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
    Provides the rows and columns of a matrix based on its 2D list representation
    as an integer tuple.

    Args:
        matrix (List): MATRIX IS GIVEN AS INPUT TO THE FUNCTION.

    Returns:
        Tuple[int, int]: The output of the given function is a tuple containing
        two elements representing the number of rows and the number of columns
        present matrix . That is:
        
        (num_rows , num_cols)

    """
    return len(matrix), len(matrix[0])
 
 
def print_matrix(matrix: List) -> None:
    """
    Print Matrix
    -----------------
    Prints elements of the input list.

    Args:
        matrix (List): The `matrix` input parameter provides a list of elements
            to be printed.

    """
    for i in range(len(matrix)):
        print(matrix[i])
 
 
def actual_strassen(matrix_a: List, matrix_b: List) -> List:
    """
    The given function actual_strassen takes two lists as input and returns a list
    of lists. It divides the matrices into four quadrants using splits and recursively
    calls itself on each quadrant. After reconstructing the new matrix from these
    quadrants it returns it.

    Args:
        matrix_a (List): The `matrix_a` input parameter is one of two matrix lists
            being operated on by the Strassen algorithm to calculate matrix multiplication.
        matrix_b (List): The `matrix_b` parameter is the other matrix being
            multiplied alongside matrix `a`.

    Returns:
        List: The function returns a list of matrices.

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
    This function strassen multiplies two matrices. If the matrices have different
    dimensions or size zero or one it raises an exception. It then checks whether
    the two matrix can be squared and makes them as close as possible square by
    adding zeros if needed; afterwards , it runs the actual Strassen multiplication
    function.

    Args:
        matrix1 (List): The `matrix1` input parameter is passed as the first operand
            for multiplication by `strassen`, which should have a square 2D list
            representing a matrix.
        matrix2 (List): In the `strassen` function given here ,the input
            `matrix2`parameter is a second list of integers to be multiplied . It
            is used alongside `matrix1`to perform the matrix multiplication using
            Strassen's algorithm .The `matrix2`parameter is checked for its
            dimensions relative to `matrix1`,and an exception is raised if the
            matrices are not compatible for multiplication.

    Returns:
        List: The output of this function is a matrix after applying actual
        Strassen's multiplication on two input matrices.

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
