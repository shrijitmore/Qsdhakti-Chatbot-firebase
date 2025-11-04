from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MasterPlantmasterViewSet,
    MasterProductionplannerViewSet,
    MasterItemmasterViewSet,
    MasterParameterlistViewSet,
    MasterOperationmasterViewSet,
    MasterBuildingsectionlabViewSet,
    UserViewSet,
    RbacRoleViewSet,
    MasterInspectionscheduleViewSet,
    InitialDataView,
    SectionsByFactoryView,
    PurchaseOrderStatusView,
    InspectionsFilterView,
    ParameterSeriesAndStatsView,
    ParameterDistributionView,
)

router = DefaultRouter()
router.register(r'plants', MasterPlantmasterViewSet)
router.register(r'productionplanners', MasterProductionplannerViewSet)
router.register(r'itemmasters', MasterItemmasterViewSet)
router.register(r'parameterlists', MasterParameterlistViewSet)
router.register(r'operationmasters', MasterOperationmasterViewSet)
router.register(r'buildingsectionlabs', MasterBuildingsectionlabViewSet)
router.register(r'users', UserViewSet)
router.register(r'roles', RbacRoleViewSet)
router.register(r'inspectionschedules', MasterInspectionscheduleViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('initial-data/', InitialDataView.as_view(), name='initial-data'),
    path('factories/<str:factory_id>/sections/', SectionsByFactoryView.as_view(), name='factory-sections'),
    path('purchase-orders/<str:po_id>/status/', PurchaseOrderStatusView.as_view(), name='po-status'),
    path('inspections/filter/', InspectionsFilterView.as_view(), name='inspections-filter'),
    path('parameters/series-and-stats/', ParameterSeriesAndStatsView.as_view(), name='parameters-series-and-stats'),
    path('parameters/distribution/', ParameterDistributionView.as_view(), name='parameters-distribution'),
]