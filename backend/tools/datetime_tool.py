from datetime import datetime
from langchain_core.tools import tool

from logger import logger


@tool
def current_datetime():
    """
    Get the current date, time, and day.

    Use this for time-sensitive research questions involving
    latest, current, today, recently, or this week.
    """

    try:
        logger.info("current_datetime called")

        now = datetime.now()

        result = {
            "date": now.strftime("%Y-%m-%d"),
            "time": now.strftime("%H:%M:%S"),
            "day": now.strftime("%A"),
        }

        logger.info("current_datetime completed successfully")

        return {
            "success": True,
            "data": result,
        }

    except Exception as e:
        logger.exception("current_datetime failed")

        return {
            "success": False,
            "error": f"Date/time error: {str(e)}",
        }


if __name__ == "__main__":
    print(current_datetime.invoke({}))