from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import (
    MasterPlantmaster, MasterProductionplanner, MasterItemmaster, 
    MasterParameterlist, MasterOperationmaster, MasterBuildingsectionlab, 
    User, RbacRole, MasterInspectionschedule,
    MasterRminspectionreading, MasterRmactualreading,
    MasterInprocessinspectionreading, MasterInprocessactualreading,
    MasterFaiinspectionschedule, MasterFaiinspectionreading, MasterFaiactualreading
)
from .serializers import (
    MasterPlantmasterSerializer, MasterProductionplannerSerializer, MasterItemmasterSerializer, 
    MasterParameterlistSerializer, MasterOperationmasterSerializer, MasterBuildingsectionlabSerializer, 
    UserSerializer, RbacRoleSerializer, MasterInspectionscheduleSerializer
)

class MasterPlantmasterViewSet(viewsets.ModelViewSet):
    queryset = MasterPlantmaster.objects.all()
    serializer_class = MasterPlantmasterSerializer

class MasterProductionplannerViewSet(viewsets.ModelViewSet):
    queryset = MasterProductionplanner.objects.all()
    serializer_class = MasterProductionplannerSerializer
    lookup_field = "order_number"

    def get_queryset(self):
        qs = super().get_queryset()
        plant_pk = self.request.query_params.get("plant")
        plant_code = self.request.query_params.get("plant_code")
        if plant_pk:
            qs = qs.filter(section__plant__id=plant_pk)
        if plant_code:
            qs = qs.filter(section__plant__plant_id=plant_code)
        return qs

class MasterItemmasterViewSet(viewsets.ModelViewSet):
    queryset = MasterItemmaster.objects.all()
    serializer_class = MasterItemmasterSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        plant_pk = self.request.query_params.get("plant")
        building_pk = self.request.query_params.get("building")
        item_type = self.request.query_params.get("item_type")
        if plant_pk:
            qs = qs.filter(plant__id=plant_pk)
        if building_pk:
            qs = qs.filter(building__id=building_pk)
        if item_type:
            qs = qs.filter(item_type=item_type)
        return qs

class MasterParameterlistViewSet(viewsets.ModelViewSet):
    queryset = MasterParameterlist.objects.all()
    serializer_class = MasterParameterlistSerializer

class MasterOperationmasterViewSet(viewsets.ModelViewSet):
    queryset = MasterOperationmaster.objects.all()
    serializer_class = MasterOperationmasterSerializer

class MasterBuildingsectionlabViewSet(viewsets.ModelViewSet):
    queryset = MasterBuildingsectionlab.objects.all()
    serializer_class = MasterBuildingsectionlabSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        plant = self.request.query_params.get("plant")
        if plant:
            qs = qs.filter(plant__id=plant)
        return qs

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class RbacRoleViewSet(viewsets.ModelViewSet):
    queryset = RbacRole.objects.all()
    serializer_class = RbacRoleSerializer

class MasterInspectionscheduleViewSet(viewsets.ModelViewSet):
    queryset = MasterInspectionschedule.objects.all()
    serializer_class = MasterInspectionscheduleSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        params = self.request.query_params
        plant_id = params.get("plant_id")
        building = params.get("building")
        item_code = params.get("item_code")
        inspection_type = params.get("inspection_type")
        po_no = params.get("po_no")
        operation = params.get("operation")
        inspection_parameter_name = params.get("inspection_parameter_name")

        if plant_id:
            qs = qs.filter(plant_id__plant_id=plant_id)
        if building:
            qs = qs.filter(building__building_id=building)
        if item_code:
            qs = qs.filter(item_code__item_code=item_code)
        if inspection_type:
            qs = qs.filter(inspection_type=inspection_type)
        if operation:
            qs = qs.filter(operation__operation_id=operation)
        if inspection_parameter_name:
            qs = qs.filter(inspection_parameter_name=inspection_parameter_name)
        # po_no is not a field on schedule; it's on readings/mapping; leaving unused
        return qs


class InitialDataView(APIView):
    def get(self, request):
        plants = MasterPlantmaster.objects.all().values("id", "plant_id", "plant_name")
        items = MasterItemmaster.objects.all().values("id", "item_code", "item_description")
        parameters = MasterParameterlist.objects.all().values("id", "inspection_parameter_id", "inspection_parameter")
        operations = MasterOperationmaster.objects.all().values("id", "operation_id", "operation_name")
        return Response({
            "plants": list(plants),
            "items": list(items),
            "parameters": list(parameters),
            "operations": list(operations),
        })


class SectionsByFactoryView(APIView):
    def get(self, request, factory_id: str):
        plant = get_object_or_404(MasterPlantmaster, plant_id=factory_id)
        sections = MasterBuildingsectionlab.objects.filter(plant=plant).values(
            "id", "building_id", "building_name"
        )
        return Response({"sections": list(sections)})


class PurchaseOrderStatusView(APIView):
    def get(self, request, po_id: str):
        po = get_object_or_404(MasterProductionplanner, order_number=po_id)
        item = None
        if po.item_code_id:
            item_obj = MasterItemmaster.objects.filter(id=po.item_code_id).values("item_code", "item_description").first()
            item = item_obj if item_obj else None
        return Response({
            "po_no": po.order_number,
            "status": po.status,
            "item": item,
            "lot_number": po.lot_number,
            "lot_qty": po.lot_qty,
            "target_date": po.target_date,
        })


class InspectionsFilterView(APIView):
    def post(self, request):
        factory_id = request.data.get("factoryId")
        item_code = request.data.get("itemCode")
        operation = request.data.get("operation")
        parameter = request.data.get("parameter")

        qs = MasterInspectionschedule.objects.all()

        if factory_id:
            try:
                plant = MasterPlantmaster.objects.get(plant_id=factory_id)
                qs = qs.filter(plant_id=plant)
            except MasterPlantmaster.DoesNotExist:
                qs = qs.none()

        if item_code:
            qs = qs.filter(item_code__item_code=item_code)

        if operation:
            qs = qs.filter(operation__operation_id=operation)

        if parameter:
            filters = Q(inspection_parameter_id__inspection_parameter_id=parameter) | Q(inspection_parameter_id__inspection_parameter=parameter)
            qs = qs.filter(filters)

        data = list(qs.values(
            "id",
            "inspection_parameter_name",
            "lsl",
            "target_value",
            "usl",
            "sample_size",
            "inspection_frequency",
            "inspection_method",
            "recording_type",
            "likely_defects_classification",
            "remarks",
            "item_code__item_code",
            "operation__operation_id",
            "building__building_id",
            "plant_id__plant_id",
        ))

        return Response({"inspections": data})


class ParameterSeriesAndStatsView(APIView):
    def get(self, request):
        return Response({"detail": "Not implemented: readings source not available"}, status=status.HTTP_501_NOT_IMPLEMENTED)


class ParameterDistributionView(APIView):
    def get(self, request):
        return Response({"detail": "Not implemented: readings source not available"}, status=status.HTTP_501_NOT_IMPLEMENTED)
