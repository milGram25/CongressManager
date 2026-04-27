from django.contrib import admin
from .models import (
    Institucion, Subarea, AreaGeneral, Sede, CostosCongreso,
    FechasCongreso, Congreso, Rubrica, RubricaCriterio,
    TipoTrabajo, Dictamen, DictamenPregunta, MesasTrabajo,
    Evento, Taller
)

admin.site.register(Institucion)
admin.site.register(Subarea)
admin.site.register(AreaGeneral)
admin.site.register(Sede)
admin.site.register(CostosCongreso)
admin.site.register(FechasCongreso)
admin.site.register(Congreso)
admin.site.register(Rubrica)
admin.site.register(RubricaCriterio)
admin.site.register(TipoTrabajo)
admin.site.register(Dictamen)
admin.site.register(DictamenPregunta)
admin.site.register(MesasTrabajo)
admin.site.register(Evento)
admin.site.register(Taller)
