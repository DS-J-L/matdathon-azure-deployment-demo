from fastapi import FastAPI

from app.core.config import Settings


def configure_telemetry(app: FastAPI, settings: Settings) -> None:
    connection_string = settings.applicationinsights_connection_string
    if not connection_string:
        return

    from azure.monitor.opentelemetry import configure_azure_monitor
    from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

    configure_azure_monitor(connection_string=connection_string)
    FastAPIInstrumentor.instrument_app(app)
