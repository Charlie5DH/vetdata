from fastapi import APIRouter, Depends
from app.core.security import require_authenticated_user
from .alerts import router as alerts_router
from .auth import router as auth_router
from .clinics import router as clinics_router
from .events import router as events_router
from .health import router as health_router
from .owners_patients import router as owners_patients_router
from .templates_measures import router as templates_measures_router
from .treatments import router as treatments_router

router = APIRouter()

# Include all routers
router.include_router(health_router, tags=["Health"])
router.include_router(auth_router, tags=["Authentication"])
router.include_router(
    clinics_router,
    tags=["Clinics"],
    dependencies=[Depends(require_authenticated_user)],
)
router.include_router(
    alerts_router,
    tags=["Alerts"],
    dependencies=[Depends(require_authenticated_user)],
)
router.include_router(
    owners_patients_router,
    tags=["Owners & Patients"],
    dependencies=[Depends(require_authenticated_user)],
)
router.include_router(
    templates_measures_router,
    tags=["Templates & Measures"],
    dependencies=[Depends(require_authenticated_user)],
)
router.include_router(
    treatments_router,
    tags=["Treatments"],
    dependencies=[Depends(require_authenticated_user)],
)
router.include_router(
    events_router,
    tags=["Events"],
    dependencies=[Depends(require_authenticated_user)],
)
