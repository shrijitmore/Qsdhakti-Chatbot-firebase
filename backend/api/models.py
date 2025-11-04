from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    middle_name = models.CharField(max_length=30, blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    user_image = models.CharField(max_length=100, blank=True, null=True)
    qc_machine = models.JSONField(blank=True, null=True)
    user_status = models.CharField(max_length=30)
    emp_id = models.CharField(max_length=30)
    plant = models.ForeignKey('MasterPlantmaster', models.DO_NOTHING, blank=True, null=True)
    role = models.ForeignKey('RbacRole', models.DO_NOTHING, blank=True, null=True)

class MasterPlantmaster(models.Model):
    id = models.BigAutoField(primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    plant_id = models.CharField(unique=True, max_length=255)
    plant_name = models.CharField(max_length=255, blank=True, null=True)
    plant_address = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey('User', models.DO_NOTHING, blank=True, null=True, related_name='masterplantmaster_created_by_set')
    updated_by = models.ForeignKey('User', models.DO_NOTHING, related_name='masterplantmaster_updated_by_set', blank=True, null=True)

    def __str__(self):
        return self.plant_name

    class Meta:
        db_table = 'master_plantmaster'


class MasterBuildingsectionlab(models.Model):
    id = models.BigAutoField(primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    building_id = models.CharField(max_length=255)
    building_name = models.CharField(max_length=255, blank=True, null=True)
    created_by = models.ForeignKey('User', models.DO_NOTHING, blank=True, null=True, related_name='masterbuildingsectionlab_created_by_set')
    updated_by = models.ForeignKey('User', models.DO_NOTHING, related_name='masterbuildingsectionlab_updated_by_set', blank=True, null=True)
    plant = models.ForeignKey('MasterPlantmaster', models.DO_NOTHING)

    def __str__(self):
        return self.building_name

    class Meta:
        db_table = 'master_buildingsectionlab'
        unique_together = (('building_id', 'plant'),)


class MasterItemmaster(models.Model):
    id = models.BigAutoField(primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    item_code = models.CharField(max_length=255)
    item_description = models.CharField(max_length=255, blank=True, null=True)
    unit = models.CharField(max_length=255, blank=True, null=True)
    item_type = models.CharField(max_length=255, blank=True, null=True)
    end_store = models.CharField(max_length=255, blank=True, null=True)
    building = models.ForeignKey(MasterBuildingsectionlab, models.DO_NOTHING)
    created_by = models.ForeignKey('User', models.DO_NOTHING, blank=True, null=True, related_name='masteritemmaster_created_by_set')
    updated_by = models.ForeignKey('User', models.DO_NOTHING, related_name='masteritemmaster_updated_by_set', blank=True, null=True)
    plant = models.ForeignKey('MasterPlantmaster', models.DO_NOTHING)

    def __str__(self):
        return self.item_code

    class Meta:
        db_table = 'master_itemmaster'
        unique_together = (('plant', 'building', 'item_code'),)


class MasterOperationmaster(models.Model):
    id = models.BigAutoField(primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    operation_id = models.CharField(max_length=255)
    operation_name = models.CharField(max_length=255, blank=True, null=True)
    operation_description = models.CharField(max_length=255, blank=True, null=True)
    building = models.ForeignKey(MasterBuildingsectionlab, models.DO_NOTHING)
    created_by = models.ForeignKey('User', models.DO_NOTHING, blank=True, null=True, related_name='masteroperationmaster_created_by_set')
    item_code = models.ForeignKey(MasterItemmaster, models.DO_NOTHING)
    updated_by = models.ForeignKey('User', models.DO_NOTHING, related_name='masteroperationmaster_updated_by_set', blank=True, null=True)
    plant = models.ForeignKey('MasterPlantmaster', models.DO_NOTHING)

    def __str__(self):
        return self.operation_name

    class Meta:
        db_table = 'master_operationmaster'
        unique_together = (('building', 'item_code', 'operation_id'),)


class MasterParameterlist(models.Model):
    id = models.BigAutoField(primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    inspection_parameter_id = models.CharField(max_length=255)
    inspection_parameter = models.CharField(max_length=255, blank=True, null=True)
    parameter_description = models.CharField(max_length=255, blank=True, null=True)
    created_by = models.ForeignKey('User', models.DO_NOTHING, blank=True, null=True, related_name='masterparameterlist_created_by_set')
    updated_by = models.ForeignKey('User', models.DO_NOTHING, related_name='masterparameterlist_updated_by_set', blank=True, null=True)
    plant = models.ForeignKey('MasterPlantmaster', models.DO_NOTHING)

    def __str__(self):
        return self.inspection_parameter

    class Meta:
        db_table = 'master_parameterlist'
        unique_together = (('plant', 'inspection_parameter'),)


class MasterProductionplanner(models.Model):
    id = models.BigAutoField(primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    order_number = models.CharField(unique=True, max_length=255, blank=True, null=True)
    lot_number = models.CharField(max_length=100, blank=True, null=True)
    lot_qty = models.IntegerField(blank=True, null=True)
    item_desc = models.CharField(max_length=255, blank=True, null=True)
    start_date = models.DateField(blank=True, null=True)
    target_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=50, blank=True, null=True)
    customer_name = models.CharField(max_length=255, blank=True, null=True)
    start_time = models.DateTimeField(blank=True, null=True)
    stop_time = models.DateTimeField(blank=True, null=True)
    duration = models.DurationField(blank=True, null=True)
    created_by = models.ForeignKey('User', models.DO_NOTHING, blank=True, null=True, related_name='masterproductionplanner_created_by_set')
    item_code = models.ForeignKey(MasterItemmaster, models.DO_NOTHING, blank=True, null=True)
    section = models.ForeignKey(MasterBuildingsectionlab, models.DO_NOTHING, blank=True, null=True)
    updated_by = models.ForeignKey('User', models.DO_NOTHING, related_name='masterproductionplanner_updated_by_set', blank=True, null=True)

    def __str__(self):
        return self.order_number

    class Meta:
        db_table = 'master_productionplanner'


class RbacRole(models.Model):
    id = models.BigAutoField(primary_key=True)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    is_active = models.BooleanField()
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey('User', models.DO_NOTHING, blank=True, null=True, related_name='rbacrole_created_by_set')
    plant = models.ForeignKey(MasterPlantmaster, models.DO_NOTHING, blank=True, null=True)
    updated_by = models.ForeignKey('User', models.DO_NOTHING, related_name='rbacrole_updated_by_set', blank=True, null=True)

    class Meta:
        db_table = 'rbac_role'


class MasterInspectionschedule(models.Model):
    id = models.BigAutoField(primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    end_store = models.CharField(max_length=255, blank=True, null=True)
    inspection_parameter_name = models.CharField(max_length=255, blank=True, null=True)
    short_text = models.CharField(max_length=255, blank=True, null=True)
    inspection_type = models.CharField(max_length=255, blank=True, null=True)
    lsl = models.FloatField(db_column='LSL', blank=True, null=True)
    target_value = models.FloatField(blank=True, null=True)
    usl = models.FloatField(db_column='USL', blank=True, null=True)
    sample_size = models.IntegerField(blank=True, null=True)
    inspection_frequency = models.CharField(max_length=255, blank=True, null=True)
    inspection_method = models.CharField(max_length=255, blank=True, null=True)
    machine_type = models.CharField(max_length=450, blank=True, null=True)
    recording_type = models.CharField(max_length=255, blank=True, null=True)
    attachment_document = models.CharField(max_length=100, blank=True, null=True)
    control_limit = models.CharField(max_length=255, blank=True, null=True)
    likely_defects_classification = models.CharField(max_length=255, blank=True, null=True)
    remarks = models.CharField(max_length=255, blank=True, null=True)
    building = models.ForeignKey(MasterBuildingsectionlab, models.DO_NOTHING)
    created_by = models.ForeignKey('User', models.DO_NOTHING, blank=True, null=True, related_name='masterinspectionschedule_created_by_set')
    updated_by = models.ForeignKey('User', models.DO_NOTHING, related_name='masterinspectionschedule_updated_by_set', blank=True, null=True)
    item_code = models.ForeignKey(MasterItemmaster, models.DO_NOTHING)
    operation = models.ForeignKey(MasterOperationmaster, models.DO_NOTHING, blank=True, null=True)
    inspection_parameter_id = models.ForeignKey(MasterParameterlist, models.DO_NOTHING)
    plant_id = models.ForeignKey(MasterPlantmaster, models.DO_NOTHING)

    class Meta:
        db_table = 'master_inspectionschedule'


# RM (Raw Material / Inward) Inspection Reading Models
class MasterRminspectionreading(models.Model):
    id = models.BigAutoField(primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    remarks = models.CharField(max_length=255, blank=True, null=True)
    attachment_document = models.CharField(max_length=100, blank=True, null=True)
    io_no = models.CharField(max_length=100, blank=True, null=True)
    input_type = models.CharField(max_length=100, blank=True, null=True)
    machine_id = models.CharField(max_length=100, blank=True, null=True)
    created_by = models.ForeignKey('User', models.DO_NOTHING, blank=True, null=True, related_name='masterrminspectionreading_created_by_set')
    insp_schedule_id = models.ForeignKey(MasterInspectionschedule, models.DO_NOTHING)
    updated_by = models.ForeignKey('User', models.DO_NOTHING, blank=True, null=True, related_name='masterrminspectionreading_updated_by_set')

    class Meta:
        db_table = 'master_rminspectionreading'


class MasterRmactualreading(models.Model):
    id = models.BigAutoField(primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    r_key = models.CharField(max_length=100, blank=True, null=True)
    r_value = models.FloatField(blank=True, null=True)
    created_by = models.ForeignKey('User', models.DO_NOTHING, blank=True, null=True, related_name='masterrmactualreading_created_by_set')
    updated_by = models.ForeignKey('User', models.DO_NOTHING, blank=True, null=True, related_name='masterrmactualreading_updated_by_set')
    reading_id = models.ForeignKey(MasterRminspectionreading, models.DO_NOTHING)

    class Meta:
        db_table = 'master_rmactualreading'


# In-process Inspection Reading Models
class MasterInprocessinspectionreading(models.Model):
    id = models.BigAutoField(primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    remarks = models.CharField(max_length=255, blank=True, null=True)
    attachment_document = models.CharField(max_length=100, blank=True, null=True)
    po_no = models.CharField(max_length=100, blank=True, null=True)
    input_type = models.CharField(max_length=100, blank=True, null=True)
    machine_id = models.CharField(max_length=100, blank=True, null=True)
    created_by = models.ForeignKey('User', models.DO_NOTHING, blank=True, null=True, related_name='masterinprocessinspectionreading_created_by_set')
    updated_by = models.ForeignKey('User', models.DO_NOTHING, blank=True, null=True, related_name='masterinprocessinspectionreading_updated_by_set')
    insp_schedule_id = models.ForeignKey(MasterInspectionschedule, models.DO_NOTHING)

    class Meta:
        db_table = 'master_inprocessinspectionreading'


class MasterInprocessactualreading(models.Model):
    id = models.BigAutoField(primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    r_key = models.CharField(max_length=100, blank=True, null=True)
    r_value = models.FloatField(blank=True, null=True)
    created_by = models.ForeignKey('User', models.DO_NOTHING, blank=True, null=True, related_name='masterinprocessactualreading_created_by_set')
    updated_by = models.ForeignKey('User', models.DO_NOTHING, blank=True, null=True, related_name='masterinprocessactualreading_updated_by_set')
    reading_id = models.ForeignKey(MasterInprocessinspectionreading, models.DO_NOTHING)

    class Meta:
        db_table = 'master_inprocessactualreading'


# FAI (Final) Inspection Schedule Model
class MasterFaiinspectionschedule(models.Model):
    id = models.BigAutoField(primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    end_store = models.CharField(max_length=255, blank=True, null=True)
    inspection_parameter_name = models.CharField(max_length=255, blank=True, null=True)
    short_text = models.CharField(max_length=255, blank=True, null=True)
    inspection_type = models.CharField(max_length=255, blank=True, null=True)
    lsl = models.FloatField(db_column='LSL', blank=True, null=True)
    target_value = models.FloatField(blank=True, null=True)
    usl = models.FloatField(db_column='USL', blank=True, null=True)
    sample_size = models.IntegerField(blank=True, null=True)
    inspection_frequency = models.CharField(max_length=255, blank=True, null=True)
    inspection_method = models.CharField(max_length=255, blank=True, null=True)
    machine_type = models.CharField(max_length=255, blank=True, null=True)
    recording_type = models.CharField(max_length=255, blank=True, null=True)
    attachment_document = models.CharField(max_length=100, blank=True, null=True)
    control_limit = models.CharField(max_length=255, blank=True, null=True)
    likely_defects_classification = models.CharField(max_length=255, blank=True, null=True)
    remarks = models.CharField(max_length=255, blank=True, null=True)
    building = models.ForeignKey(MasterBuildingsectionlab, models.DO_NOTHING)
    created_by = models.ForeignKey('User', models.DO_NOTHING, blank=True, null=True, related_name='masterfaiinspectionschedule_created_by_set')
    updated_by = models.ForeignKey('User', models.DO_NOTHING, blank=True, null=True, related_name='masterfaiinspectionschedule_updated_by_set')
    item_code = models.ForeignKey('MasterFaiitemmaster', models.DO_NOTHING)
    operation = models.ForeignKey('MasterFaioperationmaster', models.DO_NOTHING, blank=True, null=True)
    inspection_parameter_id = models.ForeignKey(MasterParameterlist, models.DO_NOTHING)
    plant_id = models.ForeignKey(MasterPlantmaster, models.DO_NOTHING)

    class Meta:
        db_table = 'master_faiinspectionschedule'


# FAI Inspection Reading Models
class MasterFaiinspectionreading(models.Model):
    id = models.BigAutoField(primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    remarks = models.CharField(max_length=255, blank=True, null=True)
    attachment_document = models.CharField(max_length=100, blank=True, null=True)
    po_no = models.CharField(max_length=100, blank=True, null=True)
    input_type = models.CharField(max_length=100, blank=True, null=True)
    machine_id = models.CharField(max_length=250, blank=True, null=True)
    created_by = models.ForeignKey('User', models.DO_NOTHING, blank=True, null=True, related_name='masterfaiinspectionreading_created_by_set')
    updated_by = models.ForeignKey('User', models.DO_NOTHING, blank=True, null=True, related_name='masterfaiinspectionreading_updated_by_set')
    insp_schedule_id = models.ForeignKey(MasterFaiinspectionschedule, models.DO_NOTHING)

    class Meta:
        db_table = 'master_faiinspectionreading'


class MasterFaiactualreading(models.Model):
    id = models.BigAutoField(primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    r_key = models.CharField(max_length=100, blank=True, null=True)
    r_value = models.FloatField(blank=True, null=True)
    created_by = models.ForeignKey('User', models.DO_NOTHING, blank=True, null=True, related_name='masterfaiactualreading_created_by_set')
    updated_by = models.ForeignKey('User', models.DO_NOTHING, blank=True, null=True, related_name='masterfaiactualreading_updated_by_set')
    reading_id = models.ForeignKey(MasterFaiinspectionreading, models.DO_NOTHING)

    class Meta:
        db_table = 'master_faiactualreading'


# FAI Item and Operation Master Models (needed for FAI schedule foreign keys)
class MasterFaiitemmaster(models.Model):
    id = models.BigAutoField(primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    item_code = models.CharField(max_length=255)
    item_description = models.CharField(max_length=255, blank=True, null=True)
    unit = models.CharField(max_length=255, blank=True, null=True)
    item_type = models.CharField(max_length=255, blank=True, null=True)
    end_store = models.CharField(max_length=255, blank=True, null=True)
    building = models.ForeignKey(MasterBuildingsectionlab, models.DO_NOTHING)
    created_by = models.ForeignKey('User', models.DO_NOTHING, blank=True, null=True, related_name='masterfaiitemmaster_created_by_set')
    updated_by = models.ForeignKey('User', models.DO_NOTHING, blank=True, null=True, related_name='masterfaiitemmaster_updated_by_set')
    plant = models.ForeignKey(MasterPlantmaster, models.DO_NOTHING)

    class Meta:
        db_table = 'master_faiitemmaster'


class MasterFaioperationmaster(models.Model):
    id = models.BigAutoField(primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    operation_id = models.CharField(max_length=255)
    operation_name = models.CharField(max_length=255, blank=True, null=True)
    operation_description = models.CharField(max_length=255, blank=True, null=True)
    building = models.ForeignKey(MasterBuildingsectionlab, models.DO_NOTHING)
    created_by = models.ForeignKey('User', models.DO_NOTHING, blank=True, null=True, related_name='masterfaioperationmaster_created_by_set')
    item_code = models.ForeignKey(MasterFaiitemmaster, models.DO_NOTHING)
    updated_by = models.ForeignKey('User', models.DO_NOTHING, blank=True, null=True, related_name='masterfaioperationmaster_updated_by_set')
    plant = models.ForeignKey(MasterPlantmaster, models.DO_NOTHING)

    class Meta:
        db_table = 'master_faioperationmaster'
