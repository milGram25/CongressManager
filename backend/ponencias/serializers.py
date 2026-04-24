from rest_framework import serializers
from .models import Resumen, Extenso, Ponencia, DictamenResumen, Evaluacion, PonenteHasPonencia, Evento

class ResumenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resumen
        fields = '__all__'

class ExtensoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Extenso
        fields = '__all__'

class DictamenResumenSerializer(serializers.ModelSerializer):
    class Meta:
        model = DictamenResumen
        fields = '__all__'

class EvaluacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evaluacion
        fields = '__all__'

class EventoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evento
        fields = '__all__'

class PonenciaSerializer(serializers.ModelSerializer):
    resumen_detalle = ResumenSerializer(source='id_resumen', read_only=True)
    extenso_detalle = ExtensoSerializer(source='id_extenso', read_only=True)
    
    class Meta:
        model = Ponencia
        fields = '__all__'

class PonenteHasPonenciaSerializer(serializers.ModelSerializer):
    ponencia_detalle = PonenciaSerializer(source='id_ponencia', read_only=True)

    class Meta:
        model = PonenteHasPonencia
        fields = '__all__'
