from decimal import Decimal, InvalidOperation
from typing import Sequence

from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Alert, TreatmentLog, TreatmentSession


def _parse_decimal(raw_value: str | None) -> Decimal | None:
    if raw_value in (None, ""):
        return None
    try:
        return Decimal(str(raw_value))
    except (InvalidOperation, ValueError):
        return None


def _resolve_thresholds(template_measure, measure) -> tuple[Decimal | None, Decimal | None]:
    lower_limit = template_measure.lower_limit if template_measure and template_measure.lower_limit is not None else measure.lower_limit
    upper_limit = template_measure.upper_limit if template_measure and template_measure.upper_limit is not None else measure.upper_limit
    return lower_limit, upper_limit


def _collect_breaches(value: Decimal, lower_limit: Decimal | None, upper_limit: Decimal | None) -> list[tuple[str, Decimal]]:
    breaches: list[tuple[str, Decimal]] = []
    if lower_limit is not None and value < lower_limit:
        breaches.append(("lower", lower_limit))
    if upper_limit is not None and value > upper_limit:
        breaches.append(("upper", upper_limit))
    return breaches


def _build_alert(*, treatment_session: TreatmentSession, treatment_log: TreatmentLog, template_measure, measure, threshold_type: str, threshold_value: Decimal, parsed_value: Decimal) -> Alert:
    comparator = "abaixo" if threshold_type == "lower" else "acima"
    return Alert(
        patient_id=treatment_session.patient_id,
        treatment_session_id=treatment_session.id,
        treatment_log_id=treatment_log.id,
        measure_id=measure.id,
        template_measure_id=template_measure.id if template_measure else None,
        threshold_type=threshold_type,
        threshold_value=threshold_value,
        triggered_value=parsed_value,
        message=f"{measure.name} está {comparator} do limite configurado.",
        status="active",
    )


async def create_alerts_for_log(
    db: AsyncSession,
    *,
    treatment_session: TreatmentSession,
    treatment_log: TreatmentLog,
    values_data: Sequence[dict],
) -> list[Alert]:
    template_measures = treatment_session.template.template_measures if treatment_session.template else []
    template_measure_by_measure_id = {
        str(template_measure.measure_id): template_measure
        for template_measure in template_measures
    }

    created_alerts: list[Alert] = []
    for value_dict in values_data:
        measure_id = str(value_dict["measure_id"])
        parsed_value = _parse_decimal(value_dict.get("value"))
        if parsed_value is None:
            continue

        template_measure = template_measure_by_measure_id.get(measure_id)
        measure = template_measure.measure if template_measure else None
        if not measure or measure.data_type != "number":
            continue

        lower_limit, upper_limit = _resolve_thresholds(
            template_measure, measure)
        breaches = _collect_breaches(parsed_value, lower_limit, upper_limit)

        for threshold_type, threshold_value in breaches:
            alert = _build_alert(
                treatment_session=treatment_session,
                treatment_log=treatment_log,
                template_measure=template_measure,
                measure=measure,
                threshold_type=threshold_type,
                threshold_value=threshold_value,
                parsed_value=parsed_value,
            )
            db.add(alert)
            created_alerts.append(alert)

    if created_alerts:
        await db.flush()

    return created_alerts
