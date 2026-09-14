def calculate(operation, a, b):
    try:
        if operation == "add":
            result = a + b

        elif operation == "subtract":
            result = a - b

        elif operation == "multiply":
            result = a * b

        elif operation == "divide":
            if b == 0:
                return {
                    "success": False,
                    "error": "Cannot divide by zero.",
                }

            result = a / b

        elif operation == "percentage_change":
            if a == 0:
                return {
                    "success": False,
                    "error": "Starting value cannot be zero.",
                }

            result = ((b - a) / a) * 100

        else:
            return {
                "success": False,
                "error": f"Invalid operation: {operation}",
            }

        return {
            "success": True,
            "data": result,
        }

    except Exception as e:
        return {
            "success": False,
            "error": f"Calculator error: {str(e)}",
        }


if __name__ == "__main__":
    print(calculate("percentage_change", 100, 120))