from datetime import datetime
from langchain_core.tools import tool


@tool
def current_datetime():
    """
    Get the current date, time, and day.

    Use this for time-sensitive research questions involving
    latest, current, today, recently, or this week.
    """

    try:
        now = datetime.now()

        return {
            "success": True,
            "data": {
                "date": now.strftime("%Y-%m-%d"),
                "time": now.strftime("%H:%M:%S"),
                "day": now.strftime("%A"),
            },
        }

    except Exception as e:
        return {
            "success": False,
            "error": f"Date/time error: {str(e)}",
        }


if __name__ == "__main__":
    print(current_datetime.invoke({}))