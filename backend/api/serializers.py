from rest_framework import serializers
from .models import (
    MasterPlantmaster,
    MasterProductionplanner,
    MasterItemmaster,
    MasterParameterlist,
    MasterOperationmaster,
    MasterBuildingsectionlab,
    User,
    RbacRole,
    MasterInspectionschedule,
)


class MasterPlantmasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = MasterPlantmaster
        fields = "__all__"


class MasterProductionplannerSerializer(serializers.ModelSerializer):
    # Frontend expects a top-level 'plant' and 'item_code' field
    plant = serializers.SerializerMethodField()
    item_code = serializers.SerializerMethodField()

    class Meta:
        model = MasterProductionplanner
        fields = (
            "id",
            "order_number",
            "lot_number",
            "lot_qty",
            "item_desc",
            "start_date",
            "target_date",
            "status",
            "customer_name",
            "start_time",
            "stop_time",
            "duration",
            "plant",
            "item_code",
            "section",
        )

    def get_plant(self, obj):
        try:
            return obj.section.plant.id
        except Exception:
            return None

    def get_item_code(self, obj):
        try:
            return obj.item_code.item_code
        except Exception:
            return None


class MasterItemmasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = MasterItemmaster
        fields = "__all__"


class MasterParameterlistSerializer(serializers.ModelSerializer):
    # Provide item_code for frontend compatibility (not in model; leave empty string)
    item_code = serializers.SerializerMethodField()

    class Meta:
        model = MasterParameterlist
        fields = (
            "id",
            "inspection_parameter_id",
            "inspection_parameter",
            "parameter_description",
            "plant",
            "item_code",
        )

    def get_item_code(self, obj):
        return ""


class MasterOperationmasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = MasterOperationmaster
        fields = "__all__"


class MasterBuildingsectionlabSerializer(serializers.ModelSerializer):
    class Meta:
        model = MasterBuildingsectionlab
        fields = "__all__"


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = "__all__"


class RbacRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = RbacRole
        fields = "__all__"


class MasterInspectionscheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = MasterInspectionschedule
        fields = "__all__"
