class InvalidFormat(Exception):
    def __init__(self, string):
        self.error = string
    
    def __str__(self):
        return self.error
    

def _raise(string, val):
    raise InvalidFormat(f"Invalid Format: {string}\n    Given: {val}")


def validate_int(val, name, range=None, string_allowed=True):
    """
    Validates that a value is an integer. If range is provided also validates
    that a value is within the proper range.

    val: Any (variable to check)
    name: string (name of variable, used for error messages)
    range: tuple of 2 ints (first must be less than or equal to second)
    string_allowed: bool (whether or not strings of ints are allowed)
    """
    try:
        int(val)
    except ValueError as ex:
        _raise(f"{name} must be of type int.", val)
    if (int(val) != val):
        if (not string_allowed or str(val) != val):
            _raise(f"{name} must be of type int.", val)
    val = int(val)
    if (range is not None):
        assert len(range) == 2
        assert range[0] <= range[1]
        if val < range[0] or val > range[1]:
            _raise(f"{name} must be in range {range}.", val)


def validate_str(val, name):
    """
    Validates that a value is a string.

    val: Any (variable to check)
    name: string (name of variable, used for error messages)
    """
    if (str(val) != val):
        _raise(f"{name} must be of type string.", val)


def check_fields(val, name, fields):
    """
    Validates that a value is a dict and that it has all the correct fields.

    val: Any (variable to check)
    name: string (name of variable, used for error messages)
    fields: list of strings
    """
    if (not isinstance(val, dict)):
        _raise(f"{name} must be a dictionary.", val)
    for field in fields:
        if field not in val:
            _raise(f"{name} must have field: {field}.", val)


def _test_invalid(fun, *args, **kwargs):
    try:
        fun(*args, **kwargs)
        assert False
    except InvalidFormat:
        pass


def validate_list(val, name):
    try:
        True in val
    except TypeError:
        _raise(f"{name} must be of type list.", val)
    if isinstance(val, dict):
        _raise(f"{name} must be of type list.", val)


def validate_list_ints(val, name, string_allowed=True):
    """
    Validates that a value is a list of ints.

    val: Any (variable to check)
    name: string (name of variable, used for error messages)
    """
    validate_list(val, name)
    for i, elem in enumerate(val):
        validate_int(elem, f"Elem {i} of {name}", string_allowed=string_allowed)


def validate_list_dicts(val, name, fields):
    validate_list(val, name)
    for i, elem in enumerate(val):
        check_fields(elem, f"Elem {i} of {name}", fields)



def test():
    validate_int(0, "test_int")
    validate_int(-1, "test_int")
    validate_int(23, "test_int")
    validate_int("1", "test_int")
    validate_int(3, "test_int_w_range", (0,5))
    validate_int(0, "test_int_w_range", (-1, 1))
    validate_int(4, "test_int_w_range", (4, 4))

    _test_invalid(validate_int, 2.5, "invalid")
    _test_invalid(validate_int, "", "invalid")
    _test_invalid(validate_int, "abc", "invalid")
    _test_invalid(validate_int, "5", "invalid", string_allowed=False)
    _test_invalid(validate_int, 6, "invalid", range=(1, 5))
    # _test_invalid(validate_int, True, "invalid") # This works and it shouldn't
    _test_invalid(validate_int, "adk", "invalid")

    validate_str("str", "test_str")
    validate_str("", "test_str")

    _test_invalid(validate_str, 234, "invalid")
    _test_invalid(validate_str, 2.5, "invalid")
    _test_invalid(validate_str, [], "invalid")
    _test_invalid(validate_str, ['s'], "invalid")
    _test_invalid(validate_str, True, "invalid")
    _test_invalid(validate_str, None, "invalid")

    test_dict = {"a": 0, "b": 1, "c": 2, "1": 1, "2": 2, "3": 3}
    check_fields(test_dict, "test_dict", ["a"])
    check_fields(test_dict, "test_dict", [])
    check_fields(test_dict, "test_dict", ["a", "b", "c"])
    check_fields(test_dict, "test_dict", ["1", "2", "3"])
    check_fields(test_dict, "test_dict", ["a", "b", "c", "1", "2", "3"])

    _test_invalid(check_fields, test_dict, "invalid", ["d"])
    _test_invalid(check_fields, test_dict, "invalid", ["a", "b", "c", "d"])
    _test_invalid(check_fields, test_dict, "invalid", [1, 2, 3])
    _test_invalid(check_fields, 0, "invalid", [])
    _test_invalid(check_fields, True, "invalid", [])
    _test_invalid(check_fields, 2.5, "invalid", [])
    _test_invalid(check_fields, "", "invalid", [])
    _test_invalid(check_fields, ["a", "b", "c"], "invalid", [])

    validate_list_ints([], "test_list")
    validate_list_ints([1, 2, 3], "test_list")
    validate_list_ints([-1, 0, 1], "test_list")
    validate_list_ints(["1", "2", "3"], "test_list")
    validate_list_ints([1, "2", 3], "test_list")
    validate_list_ints((1, 2, 3), "test_list")
    validate_list_ints((), "test_list")

    _test_invalid(validate_list_ints, 1, "invalid")
    _test_invalid(validate_list_ints, 0, "invalid")
    _test_invalid(validate_list_ints, 2.5, "invalid")
    _test_invalid(validate_list_ints, "a", "invalid")
    _test_invalid(validate_list_ints, True, "invalid")
    _test_invalid(validate_list_ints, "[]", "invalid")
    _test_invalid(validate_list_ints, {}, "invalid")
    _test_invalid(validate_list_ints, {1: 1}, "invalid")
    _test_invalid(validate_list_ints, ["a"], "invalid")
    _test_invalid(validate_list_ints, [1, 2, "a"], "invalid")
    _test_invalid(validate_list_ints, [1, "2", 3], "invalid", string_allowed=False)
    # _test_invalid(validate_list_ints, [True], "invalid") # Shouldn't work 
    _test_invalid(validate_list_ints, "[1, 2, 3]", "invalid")
    _test_invalid(validate_list_ints, [1, 2.5, 3], "invalid")

    test_dict1 = {"a": 0, "b": 1, "c": 2, "1": 1, "2": 2, "3": 3}
    test_dict2 = {"a": "a", "b": "b", "c": "c"}
    test_dict3 = {"1": "a", "2": "b", "3": "c"}
    test_dict4 = {"a": 0, "1": 1}
    validate_list_dicts([], "test_list_dict", [])
    validate_list_dicts([{}, {}, {}], "test_list_dict", [])
    validate_list_dicts([], "test_list_dict", ["123"])
    validate_list_dicts([test_dict1, test_dict4], "test_list_dict", ["a", "1"])
    validate_list_dicts([test_dict1], "test_list_dict", ["a", "b", "c", "1"])
    validate_list_dicts([test_dict1, test_dict2], "test_list_dict", ["a", "b"])
    validate_list_dicts([test_dict1, test_dict3], "test_list_dict", ["1", "2"])
    validate_list_dicts([test_dict1, test_dict2, test_dict3, test_dict4],
                        "test_list_dict", [])
    
    _test_invalid(validate_list_dicts, True, "invalid", [])
    _test_invalid(validate_list_dicts, 2, "invalid", [])
    _test_invalid(validate_list_dicts, 2.5, "invalid", [])
    _test_invalid(validate_list_dicts, [{}], "invalid", ["123"])
    _test_invalid(validate_list_dicts, {}, "invalid", [])
    _test_invalid(validate_list_dicts, [1, 2, 3], "invalid", [])
    _test_invalid(validate_list_dicts, [True], "invalid", [])
    _test_invalid(validate_list_dicts, [2.5], "invalid", [])
    _test_invalid(validate_list_dicts, [test_dict1, test_dict2], "invalid", 
                  ["a", "1"])
    _test_invalid(validate_list_dicts, [test_dict1, test_dict3], "invalid", 
                  ["a", "1"])
    _test_invalid(validate_list_dicts, 
                  [test_dict1, test_dict2, test_dict3, test_dict4], 
                  "invalid", ["a", "1"])


if __name__ == "__main__":
    test()
