import asyncio
import json
from dataclasses import dataclass
from typing import Any, Awaitable, Callable, TypeVar
from uuid import UUID

from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import User
from app.routes.alerts import list_alerts, list_session_alerts
from app.routes.auth import build_user_response
from app.routes.clinics import (
    create_clinic,
    get_my_clinic,
    invite_clinic_member,
    list_my_clinic_invitations,
    list_my_clinic_members,
    resend_my_clinic_invitation,
    update_my_clinic,
)
from app.routes.events import list_events, list_patient_events
from app.routes.owners_patients import (
    create_owner,
    create_patient,
    get_owner,
    get_patient,
    list_owners,
    list_patients,
    update_patient,
)
from app.routes.templates_measures import (
    create_measure,
    create_template,
    get_measure,
    get_template,
    list_measures,
    list_templates,
    update_measure,
    update_template,
)
from app.routes.treatments import (
    add_treatment_log,
    create_treatment_session,
    get_treatment_session,
    list_session_logs,
    list_treatment_sessions,
    update_treatment_session,
)
from app.schemas import (
    ClinicCreate,
    ClinicInvitationCreate,
    ClinicInvitationResend,
    ClinicUpdate,
    MeasureCreate,
    MeasureUpdate,
    OwnerCreate,
    PatientCreate,
    PatientUpdate,
    TemplateCreate,
    TemplateUpdate,
    TreatmentLogCreate,
    TreatmentSessionCreate,
    TreatmentSessionUpdate,
)


ToolHandler = Callable[[dict[str, Any], User, AsyncSession], Awaitable[Any]]
ModelT = TypeVar("ModelT", bound=BaseModel)


def _ensure_uuid(value: str | UUID) -> UUID:
    if isinstance(value, UUID):
        return value
    return UUID(value)


def _normalize_model_payload(schema: type[ModelT], arguments: dict[str, Any]) -> ModelT:
    return schema.model_validate(arguments)


def _json_schema(schema: type[BaseModel]) -> dict[str, Any]:
    return schema.model_json_schema()


@dataclass(frozen=True)
class ChatToolDefinition:
    name: str
    description: str
    input_schema: dict[str, Any]
    execute: ToolHandler
    requires_confirmation: bool = False


class ToolInputListOwners(BaseModel):
    skip: int = 0
    limit: int = 100


class ToolInputGetOwner(BaseModel):
    owner_id: UUID


class ToolInputListPatients(BaseModel):
    skip: int = 0
    limit: int = 100


class ToolInputGetPatient(BaseModel):
    patient_id: UUID


class ToolInputListTemplates(BaseModel):
    skip: int = 0
    limit: int = 100


class ToolInputGetTemplate(BaseModel):
    template_id: UUID


class ToolInputListMeasures(BaseModel):
    skip: int = 0
    limit: int = 100


class ToolInputGetMeasure(BaseModel):
    measure_id: UUID


class ToolInputListSessions(BaseModel):
    skip: int = 0
    limit: int = 100


class ToolInputGetSession(BaseModel):
    session_id: UUID


class ToolInputListSessionLogs(BaseModel):
    session_id: UUID


class ToolInputListAlerts(BaseModel):
    skip: int = 0
    limit: int = 50


class ToolInputListSessionAlerts(BaseModel):
    session_id: UUID
    skip: int = 0
    limit: int = 50


class ToolInputListEvents(BaseModel):
    skip: int = 0
    limit: int = 50


class ToolInputListPatientEvents(BaseModel):
    patient_id: UUID
    skip: int = 0
    limit: int = 50


class ToolInputCreateConversationClinic(BaseModel):
    name: str
    legal_name: str | None = None
    registration_document: str | None = None
    contact_email: str | None = None
    contact_phone: str | None = None
    address_line1: str | None = None
    address_line2: str | None = None
    city: str | None = None
    state: str | None = None
    postal_code: str | None = None
    notes: str | None = None


async def _execute_get_me(_arguments: dict[str, Any], current_user: User, _db: AsyncSession):
    await asyncio.sleep(0)
    return jsonable_encoder(build_user_response(current_user))


async def _execute_list_owners(arguments: dict[str, Any], current_user: User, db: AsyncSession):
    payload = ToolInputListOwners.model_validate(arguments)
    result = await list_owners(skip=payload.skip, limit=payload.limit, current_user=current_user, db=db)
    return jsonable_encoder(result)


async def _execute_get_owner(arguments: dict[str, Any], current_user: User, db: AsyncSession):
    payload = ToolInputGetOwner.model_validate(arguments)
    result = await get_owner(owner_id=payload.owner_id, current_user=current_user, db=db)
    return jsonable_encoder(result)


async def _execute_list_patients(arguments: dict[str, Any], current_user: User, db: AsyncSession):
    payload = ToolInputListPatients.model_validate(arguments)
    result = await list_patients(skip=payload.skip, limit=payload.limit, current_user=current_user, db=db)
    return jsonable_encoder(result)


async def _execute_get_patient(arguments: dict[str, Any], current_user: User, db: AsyncSession):
    payload = ToolInputGetPatient.model_validate(arguments)
    result = await get_patient(patient_id=payload.patient_id, current_user=current_user, db=db)
    return jsonable_encoder(result)


async def _execute_list_templates(arguments: dict[str, Any], _current_user: User, db: AsyncSession):
    payload = ToolInputListTemplates.model_validate(arguments)
    result = await list_templates(skip=payload.skip, limit=payload.limit, db=db)
    return jsonable_encoder(result)


async def _execute_get_template(arguments: dict[str, Any], _current_user: User, db: AsyncSession):
    payload = ToolInputGetTemplate.model_validate(arguments)
    result = await get_template(template_id=payload.template_id, db=db)
    return jsonable_encoder(result)


async def _execute_list_measures(arguments: dict[str, Any], _current_user: User, db: AsyncSession):
    payload = ToolInputListMeasures.model_validate(arguments)
    result = await list_measures(skip=payload.skip, limit=payload.limit, db=db)
    return jsonable_encoder(result)


async def _execute_get_measure(arguments: dict[str, Any], _current_user: User, db: AsyncSession):
    payload = ToolInputGetMeasure.model_validate(arguments)
    result = await get_measure(measure_id=payload.measure_id, db=db)
    return jsonable_encoder(result)


async def _execute_list_sessions(arguments: dict[str, Any], current_user: User, db: AsyncSession):
    payload = ToolInputListSessions.model_validate(arguments)
    result = await list_treatment_sessions(skip=payload.skip, limit=payload.limit, current_user=current_user, db=db)
    return jsonable_encoder(result)


async def _execute_get_session(arguments: dict[str, Any], current_user: User, db: AsyncSession):
    payload = ToolInputGetSession.model_validate(arguments)
    result = await get_treatment_session(session_id=payload.session_id, current_user=current_user, db=db)
    return jsonable_encoder(result)


async def _execute_list_session_logs(arguments: dict[str, Any], current_user: User, db: AsyncSession):
    payload = ToolInputListSessionLogs.model_validate(arguments)
    result = await list_session_logs(session_id=payload.session_id, current_user=current_user, db=db)
    return jsonable_encoder(result)


async def _execute_list_alerts(arguments: dict[str, Any], current_user: User, db: AsyncSession):
    payload = ToolInputListAlerts.model_validate(arguments)
    result = await list_alerts(current_user=current_user, db=db, skip=payload.skip, limit=payload.limit)
    return jsonable_encoder(result)


async def _execute_list_session_alerts(arguments: dict[str, Any], current_user: User, db: AsyncSession):
    payload = ToolInputListSessionAlerts.model_validate(arguments)
    result = await list_session_alerts(session_id=payload.session_id, current_user=current_user, db=db, skip=payload.skip, limit=payload.limit)
    return jsonable_encoder(result)


async def _execute_list_events(arguments: dict[str, Any], current_user: User, db: AsyncSession):
    payload = ToolInputListEvents.model_validate(arguments)
    result = await list_events(current_user=current_user, db=db, skip=payload.skip, limit=payload.limit)
    return jsonable_encoder(result)


async def _execute_list_patient_events(arguments: dict[str, Any], current_user: User, db: AsyncSession):
    payload = ToolInputListPatientEvents.model_validate(arguments)
    result = await list_patient_events(patient_id=payload.patient_id, current_user=current_user, db=db, skip=payload.skip, limit=payload.limit)
    return jsonable_encoder(result)


async def _execute_get_my_clinic(_arguments: dict[str, Any], current_user: User, db: AsyncSession):
    result = await get_my_clinic(current_user=current_user, db=db)
    return jsonable_encoder(result)


async def _execute_list_clinic_members(_arguments: dict[str, Any], current_user: User, db: AsyncSession):
    result = await list_my_clinic_members(current_user=current_user, db=db)
    return jsonable_encoder(result)


async def _execute_list_clinic_invitations(_arguments: dict[str, Any], current_user: User, db: AsyncSession):
    result = await list_my_clinic_invitations(current_user=current_user, db=db)
    return jsonable_encoder(result)


async def _execute_create_owner(arguments: dict[str, Any], current_user: User, db: AsyncSession):
    payload = _normalize_model_payload(OwnerCreate, arguments)
    result = await create_owner(owner=payload, current_user=current_user, db=db)
    return jsonable_encoder(result)


async def _execute_create_patient(arguments: dict[str, Any], current_user: User, db: AsyncSession):
    payload = _normalize_model_payload(PatientCreate, arguments)
    result = await create_patient(patient=payload, current_user=current_user, db=db)
    return jsonable_encoder(result)


async def _execute_update_patient(arguments: dict[str, Any], current_user: User, db: AsyncSession):
    payload = arguments.copy()
    patient_id = _ensure_uuid(payload.pop("patient_id"))
    body = _normalize_model_payload(PatientUpdate, payload)
    result = await update_patient(patient_id=patient_id, patient_update=body, current_user=current_user, db=db)
    return jsonable_encoder(result)


async def _execute_create_measure(arguments: dict[str, Any], _current_user: User, db: AsyncSession):
    payload = _normalize_model_payload(MeasureCreate, arguments)
    result = await create_measure(measure=payload, db=db)
    return jsonable_encoder(result)


async def _execute_update_measure(arguments: dict[str, Any], _current_user: User, db: AsyncSession):
    payload = arguments.copy()
    measure_id = _ensure_uuid(payload.pop("measure_id"))
    body = _normalize_model_payload(MeasureUpdate, payload)
    result = await update_measure(measure_id=measure_id, measure_data=body, db=db)
    return jsonable_encoder(result)


async def _execute_create_template(arguments: dict[str, Any], _current_user: User, db: AsyncSession):
    payload = _normalize_model_payload(TemplateCreate, arguments)
    result = await create_template(template=payload, db=db)
    return jsonable_encoder(result)


async def _execute_update_template(arguments: dict[str, Any], _current_user: User, db: AsyncSession):
    payload = arguments.copy()
    template_id = _ensure_uuid(payload.pop("template_id"))
    body = _normalize_model_payload(TemplateUpdate, payload)
    result = await update_template(template_id=template_id, template_data=body, db=db)
    return jsonable_encoder(result)


async def _execute_create_treatment_session(arguments: dict[str, Any], current_user: User, db: AsyncSession):
    payload = _normalize_model_payload(TreatmentSessionCreate, arguments)
    result = await create_treatment_session(session=payload, current_user=current_user, db=db)
    return jsonable_encoder(result)


async def _execute_update_treatment_session(arguments: dict[str, Any], current_user: User, db: AsyncSession):
    payload = arguments.copy()
    session_id = _ensure_uuid(payload.pop("session_id"))
    body = _normalize_model_payload(TreatmentSessionUpdate, payload)
    result = await update_treatment_session(session_id=session_id, session_update=body, current_user=current_user, db=db)
    return jsonable_encoder(result)


async def _execute_add_treatment_log(arguments: dict[str, Any], current_user: User, db: AsyncSession):
    payload = arguments.copy()
    session_id = _ensure_uuid(payload.pop("session_id"))
    body = _normalize_model_payload(TreatmentLogCreate, payload)
    result = await add_treatment_log(session_id=session_id, log=body, current_user=current_user, db=db)
    return jsonable_encoder(result)


async def _execute_create_clinic(arguments: dict[str, Any], current_user: User, db: AsyncSession):
    payload = _normalize_model_payload(ClinicCreate, arguments)
    result = await create_clinic(payload=payload, current_user=current_user, db=db)
    return jsonable_encoder(result)


async def _execute_update_clinic(arguments: dict[str, Any], current_user: User, db: AsyncSession):
    payload = _normalize_model_payload(ClinicUpdate, arguments)
    result = await update_my_clinic(payload=payload, current_user=current_user, db=db)
    return jsonable_encoder(result)


async def _execute_invite_clinic_member(arguments: dict[str, Any], current_user: User, db: AsyncSession):
    payload = _normalize_model_payload(ClinicInvitationCreate, arguments)
    result = await invite_clinic_member(payload=payload, current_user=current_user, db=db)
    return jsonable_encoder(result)


async def _execute_resend_clinic_invitation(arguments: dict[str, Any], current_user: User, db: AsyncSession):
    payload = arguments.copy()
    invitation_id = _ensure_uuid(payload.pop("invitation_id"))
    body = _normalize_model_payload(ClinicInvitationResend, payload)
    result = await resend_my_clinic_invitation(invitation_id=invitation_id, payload=body, current_user=current_user, db=db)
    return jsonable_encoder(result)


def build_tool_definitions() -> dict[str, ChatToolDefinition]:
    return {
        "get_current_user": ChatToolDefinition(
            name="get_current_user",
            description="Obtém o contexto do usuário autenticado e sua clínica atual.",
            input_schema={"type": "object", "properties": {},
                          "additionalProperties": False},
            execute=_execute_get_me,
        ),
        "get_my_clinic": ChatToolDefinition(
            name="get_my_clinic",
            description="Obtém os dados da clínica atual do usuário.",
            input_schema={"type": "object", "properties": {},
                          "additionalProperties": False},
            execute=_execute_get_my_clinic,
        ),
        "list_clinic_members": ChatToolDefinition(
            name="list_clinic_members",
            description="Lista os membros da clínica atual.",
            input_schema={"type": "object", "properties": {},
                          "additionalProperties": False},
            execute=_execute_list_clinic_members,
        ),
        "list_clinic_invitations": ChatToolDefinition(
            name="list_clinic_invitations",
            description="Lista os convites pendentes da clínica atual.",
            input_schema={"type": "object", "properties": {},
                          "additionalProperties": False},
            execute=_execute_list_clinic_invitations,
        ),
        "list_owners": ChatToolDefinition("list_owners", "Lista tutores da clínica.", _json_schema(ToolInputListOwners), _execute_list_owners),
        "get_owner": ChatToolDefinition("get_owner", "Obtém um tutor pelo ID.", _json_schema(ToolInputGetOwner), _execute_get_owner),
        "list_patients": ChatToolDefinition("list_patients", "Lista pacientes da clínica.", _json_schema(ToolInputListPatients), _execute_list_patients),
        "get_patient": ChatToolDefinition("get_patient", "Obtém um paciente pelo ID.", _json_schema(ToolInputGetPatient), _execute_get_patient),
        "list_templates": ChatToolDefinition("list_templates", "Lista modelos de tratamento.", _json_schema(ToolInputListTemplates), _execute_list_templates),
        "get_template": ChatToolDefinition("get_template", "Obtém um modelo de tratamento pelo ID.", _json_schema(ToolInputGetTemplate), _execute_get_template),
        "list_measures": ChatToolDefinition("list_measures", "Lista medidas disponíveis.", _json_schema(ToolInputListMeasures), _execute_list_measures),
        "get_measure": ChatToolDefinition("get_measure", "Obtém uma medida pelo ID.", _json_schema(ToolInputGetMeasure), _execute_get_measure),
        "list_sessions": ChatToolDefinition("list_sessions", "Lista sessões de tratamento da clínica.", _json_schema(ToolInputListSessions), _execute_list_sessions),
        "get_session": ChatToolDefinition("get_session", "Obtém os detalhes de uma sessão de tratamento.", _json_schema(ToolInputGetSession), _execute_get_session),
        "list_session_logs": ChatToolDefinition("list_session_logs", "Lista os registros de uma sessão de tratamento.", _json_schema(ToolInputListSessionLogs), _execute_list_session_logs),
        "list_alerts": ChatToolDefinition("list_alerts", "Lista alertas clínicos da clínica.", _json_schema(ToolInputListAlerts), _execute_list_alerts),
        "list_session_alerts": ChatToolDefinition("list_session_alerts", "Lista alertas de uma sessão específica.", _json_schema(ToolInputListSessionAlerts), _execute_list_session_alerts),
        "list_events": ChatToolDefinition("list_events", "Lista eventos clínicos recentes.", _json_schema(ToolInputListEvents), _execute_list_events),
        "list_patient_events": ChatToolDefinition("list_patient_events", "Lista eventos de um paciente.", _json_schema(ToolInputListPatientEvents), _execute_list_patient_events),
        "create_owner": ChatToolDefinition("create_owner", "Cria um novo tutor.", _json_schema(OwnerCreate), _execute_create_owner, True),
        "create_patient": ChatToolDefinition("create_patient", "Cria um novo paciente.", _json_schema(PatientCreate), _execute_create_patient, True),
        "update_patient": ChatToolDefinition(
            "update_patient",
            "Atualiza um paciente existente. Exige patient_id mais os campos completos do paciente.",
            {
                "type": "object",
                "properties": {
                    "patient_id": {"type": "string", "format": "uuid"},
                    **json.loads(json.dumps(_json_schema(PatientUpdate))).get("properties", {}),
                },
                "required": ["patient_id", *PatientUpdate.model_fields.keys()],
                "additionalProperties": False,
            },
            _execute_update_patient,
            True,
        ),
        "create_measure": ChatToolDefinition("create_measure", "Cria uma nova medida.", _json_schema(MeasureCreate), _execute_create_measure, True),
        "update_measure": ChatToolDefinition(
            "update_measure",
            "Atualiza uma medida existente. Exige measure_id mais os campos completos da medida.",
            {
                "type": "object",
                "properties": {
                    "measure_id": {"type": "string", "format": "uuid"},
                    **json.loads(json.dumps(_json_schema(MeasureUpdate))).get("properties", {}),
                },
                "required": ["measure_id", *MeasureUpdate.model_fields.keys()],
                "additionalProperties": False,
            },
            _execute_update_measure,
            True,
        ),
        "create_template": ChatToolDefinition("create_template", "Cria um novo modelo de tratamento.", _json_schema(TemplateCreate), _execute_create_template, True),
        "update_template": ChatToolDefinition(
            "update_template",
            "Atualiza um modelo existente. Exige template_id mais o payload completo do modelo.",
            {
                "type": "object",
                "properties": {
                    "template_id": {"type": "string", "format": "uuid"},
                    **json.loads(json.dumps(_json_schema(TemplateUpdate))).get("properties", {}),
                },
                "required": ["template_id", *TemplateUpdate.model_fields.keys()],
                "additionalProperties": False,
            },
            _execute_update_template,
            True,
        ),
        "create_treatment_session": ChatToolDefinition("create_treatment_session", "Inicia uma nova sessão de tratamento.", _json_schema(TreatmentSessionCreate), _execute_create_treatment_session, True),
        "update_treatment_session": ChatToolDefinition(
            "update_treatment_session",
            "Atualiza uma sessão existente. Exige session_id mais os campos de atualização.",
            {
                "type": "object",
                "properties": {
                    "session_id": {"type": "string", "format": "uuid"},
                    **json.loads(json.dumps(_json_schema(TreatmentSessionUpdate))).get("properties", {}),
                },
                "required": ["session_id"],
                "additionalProperties": False,
            },
            _execute_update_treatment_session,
            True,
        ),
        "add_treatment_log": ChatToolDefinition(
            "add_treatment_log",
            "Adiciona um novo registro de monitoramento a uma sessão. Exige session_id mais o payload do log.",
            {
                "type": "object",
                "properties": {
                    "session_id": {"type": "string", "format": "uuid"},
                    **json.loads(json.dumps(_json_schema(TreatmentLogCreate))).get("properties", {}),
                },
                "required": ["session_id"],
                "additionalProperties": False,
            },
            _execute_add_treatment_log,
            True,
        ),
        "create_clinic": ChatToolDefinition("create_clinic", "Cria uma nova clínica para o usuário atual.", _json_schema(ClinicCreate), _execute_create_clinic, True),
        "update_clinic": ChatToolDefinition("update_clinic", "Atualiza os dados da clínica atual.", _json_schema(ClinicUpdate), _execute_update_clinic, True),
        "invite_clinic_member": ChatToolDefinition("invite_clinic_member", "Convida um usuário para a clínica atual.", _json_schema(ClinicInvitationCreate), _execute_invite_clinic_member, True),
        "resend_clinic_invitation": ChatToolDefinition(
            "resend_clinic_invitation",
            "Reenvia um convite pendente da clínica. Exige invitation_id.",
            {
                "type": "object",
                "properties": {
                    "invitation_id": {"type": "string", "format": "uuid"},
                    **json.loads(json.dumps(_json_schema(ClinicInvitationResend))).get("properties", {}),
                },
                "required": ["invitation_id"],
                "additionalProperties": False,
            },
            _execute_resend_clinic_invitation,
            True,
        ),
    }


TOOL_DEFINITIONS = build_tool_definitions()
