@pytest.mark.task(taskno=2)
def test_get_change(self):
    test_data = [(463000, 5000), (1250, 120), (15000, 1380)]
    result_data = [458000, 1130, 13620]

    for variant, (params, expected) in enumerate(zip(test_data, result_data), start=1):
        budget, exchanging_value = params

        with self.subTest(
            f"variation #{variant}",
            budget=budget,
            exchanging_value=exchanging_value,
            expected=expected,
        ):

            actual_result = get_change(*params)
            error_message = (
                f"Called get_change{budget, exchanging_value}. "
                f"The function returned {actual_result}, but "
                f"The tests expected {expected} left in your budget."
            )

            self.assertAlmostEqual(actual_result, expected, msg=error_message)
