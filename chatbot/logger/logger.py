import logging
import os
from logging.handlers import RotatingFileHandler

class Logger:
    def __init__(self, log_level="ERROR", log_dir="logs", log_file="app.log"):
        """
        Initialize the logger with the specified log level and log file.

        :param log_level: Log level (ERROR, DEBUG, etc.)
        :param log_dir: Directory to store log files
        :param log_file: Name of the log file
        """
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(self._get_log_level(log_level))

        # Ensure the log directory exists
        os.makedirs(log_dir, exist_ok=True)

        # Create a rotating file handler
        log_path = os.path.join(log_dir, log_file)
        handler = RotatingFileHandler(log_path, maxBytes=5 * 1024 * 1024, backupCount=5)
        
        # Create formatter and add it to the handler
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        
        # Add the handler to the logger
        self.logger.addHandler(handler)

    def _get_log_level(self, log_level):
        """Convert string log level to logging module's log level."""
        levels = {
            "DEBUG": logging.DEBUG,
            "INFO": logging.INFO,
            "WARNING": logging.WARNING,
            "ERROR": logging.ERROR,
            "CRITICAL": logging.CRITICAL
        }
        return levels.get(log_level.upper(), logging.ERROR)

    def debug(self, message):
        """Log a debug message."""
        self.logger.debug(message)

    def error(self, message):
        """Log an error message."""
        self.logger.error(message)

# log_config.py
class LogConfig:
    """
    Configuration class for setting which logs to display.
    """
    @staticmethod
    def get_logging_option():
        """Return the logging option based on user preference."""
        options = {
            "error": "ERROR",
            "debug": "DEBUG",
            "both": "DEBUG",
        }

        # Here, you'd typically load the user preference from an environment variable or config file
        user_choice = os.getenv("LOG_LEVEL", "both").lower()
        return options.get(user_choice, "ERROR")